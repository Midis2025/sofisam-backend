import mongoose from 'mongoose';
import { Resend } from 'resend';
import connectToDatabase from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import Enquiry from '@/models/Enquiry';
import { EmailType } from '@/types';
import {
  ContactEnquiryEmailData,
  SAMPLE_CONTACT_ENQUIRY,
  renderContactEnquiryHtml,
  renderContactEnquiryText,
} from '@/lib/email-templates/contact-enquiry';
import {
  ThankYouEmailData,
  SAMPLE_THANK_YOU_EMAIL,
  renderThankYouEmailHtml,
  renderThankYouEmailText,
} from '@/lib/email-templates/thank-you';
import { getEmailLogoHtml } from '@/lib/email-branding';

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key || key.includes('REPLACE_WITH') || key.includes('re_your_')) return null;
  return new Resend(key);
}

export function getSenderEmail(): string {
  const fromEnv = process.env.RESEND_FROM_EMAIL?.trim();
  if (!fromEnv) {
    return 'SOFISAM <onboarding@resend.dev>';
  }
  // Resend strictly requires a verified custom domain on DNS.
  // If an unverified public webmail address (e.g. gmail.com) is supplied in environment variables,
  // fallback to Resend's official development sender 'onboarding@resend.dev' with brand prefix
  // to prevent Resend API validation error (HTTP 403: "The gmail.com domain is not verified").
  if (/@(gmail|googlemail|yahoo|hotmail|outlook)\.com/i.test(fromEnv)) {
    return 'SOFISAM <onboarding@resend.dev>';
  }
  return fromEnv;
}

export function getAdminRecipient(): string {
  return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'admin@sofisam.com';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface LogDispatchOptions {
  recipient: string;
  sender: string;
  subject: string;
  emailType: EmailType;
  relatedEnquiryId?: mongoose.Types.ObjectId | string;
  relatedEnquiryReference?: string;
  executeSend: () => Promise<{ data?: { id?: string } | null; error?: { message?: string } | null }>;
}

/**
 * Robust non-blocking wrapper to log every email attempt, record Resend response,
 * and track initial status (queued -> sent / failed).
 */
export async function dispatchAndLogEmail(options: LogDispatchOptions): Promise<{
  success: boolean;
  resendEmailId?: string;
  emailLogId?: string;
  error?: string;
}> {
  let logId: string | null = null;

  // 1. Create initial EmailLog record
  try {
    await connectToDatabase();

    let relatedEnquiryId = options.relatedEnquiryId;
    if (!relatedEnquiryId && options.relatedEnquiryReference) {
      try {
        const enq = await Enquiry.findOne({ enquiryReference: options.relatedEnquiryReference })
          .select('_id')
          .lean();
        if (enq?._id) {
          relatedEnquiryId = enq._id as mongoose.Types.ObjectId;
        }
      } catch {
        // non-blocking lookup
      }
    }

    const initialLog = await EmailLog.create({
      recipient: options.recipient.toLowerCase().trim(),
      sender: options.sender,
      subject: options.subject,
      emailType: options.emailType,
      provider: 'resend',
      status: 'queued',
      relatedEnquiryId,
      relatedEnquiryReference: options.relatedEnquiryReference,
      events: [
        {
          eventType: 'email.created',
          timestamp: new Date(),
          details: 'Email queued for transmission',
        },
      ],
      eventHistory: [
        {
          eventType: 'email.created',
          timestamp: new Date(),
          details: 'Email queued for transmission',
        },
      ],
    });
    logId = initialLog._id.toString();
  } catch (dbErr) {
    console.error('[Email Logging] Failed to create initial EmailLog in MongoDB:', dbErr);
  }

  // 2. Validate Resend client availability
  const resend = getResendClient();
  if (!resend) {
    const errorMsg = 'RESEND_API_KEY is not configured. Email dispatch skipped.';
    console.log(`[Email Service] ${errorMsg}`);
    if (logId) {
      try {
        await EmailLog.findByIdAndUpdate(logId, {
          status: 'failed',
          failedAt: new Date(),
          lastEventAt: new Date(),
          errorMessage: errorMsg,
          $push: {
            events: {
              eventType: 'email.failed',
              timestamp: new Date(),
              details: errorMsg,
            },
            eventHistory: {
              eventType: 'email.failed',
              timestamp: new Date(),
              details: errorMsg,
            },
          },
        });
      } catch (e) {
        console.error('[Email Logging] Failed to update EmailLog status:', e);
      }
    }
    return { success: false, error: errorMsg, emailLogId: logId || undefined };
  }

  // 3. Send email via Resend API
  try {
    const { data, error } = await options.executeSend();

    if (error || !data?.id) {
      const errText = error?.message || 'Resend rejected the transmission request';
      console.error(`[Email Service] Resend API error for ${options.recipient}:`, errText);
      if (logId) {
        await EmailLog.findByIdAndUpdate(logId, {
          status: 'failed',
          failedAt: new Date(),
          lastEventAt: new Date(),
          errorMessage: errText,
          $push: {
            events: {
              eventType: 'email.failed',
              timestamp: new Date(),
              details: `Resend error: ${errText}`,
            },
            eventHistory: {
              eventType: 'email.failed',
              timestamp: new Date(),
              details: `Resend error: ${errText}`,
            },
          },
        });
      }
      return { success: false, error: errText, emailLogId: logId || undefined };
    }

    // Successfully accepted by Resend
    const resendId = data.id;
    if (logId) {
      await EmailLog.findByIdAndUpdate(logId, {
        resendEmailId: resendId,
        status: 'sent',
        sentAt: new Date(),
        lastEventAt: new Date(),
        $push: {
          events: {
            eventType: 'email.sent',
            timestamp: new Date(),
            details: `Accepted by Resend API (ID: ${resendId})`,
          },
          eventHistory: {
            eventType: 'email.sent',
            timestamp: new Date(),
            details: `Accepted by Resend API (ID: ${resendId})`,
          },
        },
      });
    }

    return { success: true, resendEmailId: resendId, emailLogId: logId || undefined };
  } catch (sendErr: unknown) {
    const errText = (sendErr as Error)?.message || 'Unexpected exception during dispatch';
    console.error(`[Email Service] Dispatch exception for ${options.recipient}:`, sendErr);
    if (logId) {
      try {
        await EmailLog.findByIdAndUpdate(logId, {
          status: 'failed',
          failedAt: new Date(),
          lastEventAt: new Date(),
          errorMessage: errText,
          $push: {
            events: {
              eventType: 'email.failed',
              timestamp: new Date(),
              details: `Exception: ${errText}`,
            },
            eventHistory: {
              eventType: 'email.failed',
              timestamp: new Date(),
              details: `Exception: ${errText}`,
            },
          },
        });
      } catch (e) {
        console.error('[Email Logging] Failed to update EmailLog exception:', e);
      }
    }
    return { success: false, error: errText, emailLogId: logId || undefined };
  }
}

export interface SendEnquiryEmailsArgs {
  referenceId: string;
  formType: 'private_enquiry' | 'contact';
  name: string;
  email: string;
  phone?: string | null;
  organisation?: string;
  company?: string;
  areaOfInterest?: string;
  subject?: string;
  message: string;
  submittedAt: Date;
  sourcePage: string;
}

export async function sendEnquiryEmails(args: SendEnquiryEmailsArgs): Promise<{
  adminNotification: 'sent' | 'failed';
  customerAcknowledgement: 'sent' | 'failed';
}> {
  const result: {
    adminNotification: 'sent' | 'failed';
    customerAcknowledgement: 'sent' | 'failed';
  } = {
    adminNotification: 'failed',
    customerAcknowledgement: 'failed',
  };

  const isPrivate = args.formType === 'private_enquiry';
  const typeLabel = isPrivate ? 'Private Office Mandate' : 'General Contact Enquiry';

  const SENDER_EMAIL = getSenderEmail();
  const ADMIN_RECIPIENT = getAdminRecipient();
  const resend = getResendClient();

  // 1. Admin Notification Email (Independent dispatch & duplicate protected)
  try {
    const existingAdminLog = await EmailLog.findOne({
      relatedEnquiryReference: args.referenceId,
      emailType: 'admin_notification',
      status: { $in: ['queued', 'sent', 'delivered'] },
    }).lean();

    if (existingAdminLog) {
      console.log(`[Email Dispatch] Admin notification already sent for ${args.referenceId}.`);
      result.adminNotification = 'sent';
    } else {
      let adminSubject: string;
      let adminHtml: string;
      let adminText: string | undefined;

      if (args.formType === 'contact') {
        adminSubject = `New Contact Enquiry | SOFISAM | ${args.name}`;
        adminHtml = renderContactEnquiryHtml({
          referenceId: args.referenceId,
          name: args.name,
          email: args.email,
          phone: args.phone,
          company: args.company || args.organisation,
          organisation: args.organisation || args.company,
          subject: args.subject || args.areaOfInterest,
          areaOfInterest: args.areaOfInterest || args.subject,
          message: args.message,
          submittedAt: args.submittedAt,
          sourcePage: args.sourcePage,
          websiteUrl: process.env.FRONTEND_URL || 'https://sofisam-seven.vercel.app',
        });
        adminText = renderContactEnquiryText({
          referenceId: args.referenceId,
          name: args.name,
          email: args.email,
          phone: args.phone,
          company: args.company || args.organisation,
          organisation: args.organisation || args.company,
          subject: args.subject || args.areaOfInterest,
          areaOfInterest: args.areaOfInterest || args.subject,
          message: args.message,
          submittedAt: args.submittedAt,
          sourcePage: args.sourcePage,
          websiteUrl: process.env.FRONTEND_URL || 'https://sofisam-seven.vercel.app',
        });
      } else {
        adminSubject = `[SOFISAM] New ${typeLabel}: ${args.name} (${args.referenceId})`;
        adminHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F2EA; padding: 32px 16px; color: #171717;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #DED7CA; overflow: hidden; box-shadow: 0 4px 12px rgba(40,30,15,0.04);">
            <div style="background-color: #0B0B0D; padding: 24px 32px; border-bottom: 3px solid #C7A46A;">
              ${getEmailLogoHtml({ width: 130, height: 32 })}
              <p style="color: #C7A46A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 8px 0 0 0; font-weight: 600;">Executive Mandate Notification</p>
            </div>
            <div style="padding: 32px;">
              <div style="display: inline-block; background-color: #FBF9F5; border: 1px solid #DED7CA; color: #7A5D33; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 6px; text-transform: uppercase; margin-bottom: 20px;">
                ${escapeHtml(typeLabel)}
              </div>
              <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #171717;">New Submission: ${escapeHtml(args.referenceId)}</h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 8px 0; color: #66625B; width: 140px; border-bottom: 1px solid #EAE4D9;">Client / Principal:</td>
                  <td style="padding: 8px 0; color: #171717; font-weight: 600; border-bottom: 1px solid #EAE4D9;">${escapeHtml(args.name)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #66625B; border-bottom: 1px solid #EAE4D9;">Email Address:</td>
                  <td style="padding: 8px 0; color: #171717; border-bottom: 1px solid #EAE4D9;"><a href="mailto:${escapeHtml(args.email)}" style="color: #7A5D33; text-decoration: underline;">${escapeHtml(args.email)}</a></td>
                </tr>
                ${args.organisation ? `
                <tr>
                  <td style="padding: 8px 0; color: #66625B; border-bottom: 1px solid #EAE4D9;">Organisation:</td>
                  <td style="padding: 8px 0; color: #171717; border-bottom: 1px solid #EAE4D9;">${escapeHtml(args.organisation)}</td>
                </tr>` : ''}
                ${args.areaOfInterest ? `
                <tr>
                  <td style="padding: 8px 0; color: #66625B; border-bottom: 1px solid #EAE4D9;">Area of Interest:</td>
                  <td style="padding: 8px 0; color: #C7A46A; font-weight: 600; border-bottom: 1px solid #EAE4D9;">${escapeHtml(args.areaOfInterest)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #66625B; border-bottom: 1px solid #EAE4D9;">Source Page:</td>
                  <td style="padding: 8px 0; color: #66625B; border-bottom: 1px solid #EAE4D9;">${escapeHtml(args.sourcePage)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #66625B;">Submission Time:</td>
                  <td style="padding: 8px 0; color: #171717;">${new Date(args.submittedAt).toUTCString()}</td>
                </tr>
              </table>

              <div style="background-color: #FBF9F5; border: 1px solid #DED7CA; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #66625B; margin: 0 0 8px 0; font-weight: 700;">Client Message</p>
                <p style="font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #171717; margin: 0; white-space: pre-wrap;">${escapeHtml(args.message)}</p>
              </div>

              <div style="text-align: center; padding-top: 12px;">
                <a href="https://sofisam-backend.vercel.app/enquiries" style="display: inline-block; background-color: #0B0B0D; color: #F2EEE6; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Review in Admin Dashboard</a>
              </div>
            </div>
          </div>
        </div>
        `;
      }

      const adminDispatch = await dispatchAndLogEmail({
        recipient: ADMIN_RECIPIENT,
        sender: SENDER_EMAIL,
        subject: adminSubject,
        emailType: 'admin_notification',
        relatedEnquiryReference: args.referenceId,
        executeSend: () =>
          resend!.emails.send({
            from: SENDER_EMAIL,
            to: ADMIN_RECIPIENT,
            subject: adminSubject,
            html: adminHtml,
            ...(adminText ? { text: adminText } : {}),
          }),
      });

      result.adminNotification = adminDispatch.success ? 'sent' : 'failed';
    }
  } catch (adminErr) {
    console.error(`[Email Dispatch] Failed admin notification for ${args.referenceId}:`, adminErr);
    result.adminNotification = 'failed';
  }

  // 2. Customer Acknowledgement Email (Using official architectural thank-you template; duplicate protected)
  try {
    const existingCustLog = await EmailLog.findOne({
      relatedEnquiryReference: args.referenceId,
      emailType: 'customer_acknowledgement',
      status: { $in: ['queued', 'sent', 'delivered'] },
    }).lean();

    if (existingCustLog) {
      console.log(`[Email Dispatch] Customer thank-you email already sent for ${args.referenceId}.`);
      result.customerAcknowledgement = 'sent';
    } else {
      const customerSubject = `Thank You for Your Enquiry | SOFISAM | ${args.referenceId}`;
      const customerHtml = renderThankYouEmailHtml({
        name: args.name,
        email: args.email,
        referenceId: args.referenceId,
        enquiryType: typeLabel,
        organisation: args.organisation || args.company,
        areaOfInterest: args.areaOfInterest || args.subject,
        submittedAt: args.submittedAt,
        websiteUrl: process.env.FRONTEND_URL || 'https://sofisam-seven.vercel.app',
      });
      const customerText = renderThankYouEmailText({
        name: args.name,
        email: args.email,
        referenceId: args.referenceId,
        enquiryType: typeLabel,
        organisation: args.organisation || args.company,
        areaOfInterest: args.areaOfInterest || args.subject,
        submittedAt: args.submittedAt,
        websiteUrl: process.env.FRONTEND_URL || 'https://sofisam-seven.vercel.app',
      });

      const customerDispatch = await dispatchAndLogEmail({
        recipient: args.email,
        sender: SENDER_EMAIL,
        subject: customerSubject,
        emailType: 'customer_acknowledgement',
        relatedEnquiryReference: args.referenceId,
        executeSend: () =>
          resend!.emails.send({
            from: SENDER_EMAIL,
            to: args.email,
            subject: customerSubject,
            html: customerHtml,
            text: customerText,
          }),
      });

      result.customerAcknowledgement = customerDispatch.success ? 'sent' : 'failed';
    }
  } catch (custErr) {
    console.error(`[Email Dispatch] Failed customer acknowledgement for ${args.referenceId}:`, custErr);
    result.customerAcknowledgement = 'failed';
  }

  return result;
}

export async function sendNewsletterConfirmation(email: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();

  // Prevent duplicate welcome emails if already dispatched
  try {
    const existingLog = await EmailLog.findOne({
      recipient: normEmail,
      emailType: 'newsletter_welcome',
      status: { $in: ['queued', 'sent', 'delivered'] },
    }).lean();

    if (existingLog) {
      console.log(`[Newsletter Dispatch] Welcome confirmation already dispatched for ${normEmail}. Skipping duplicate.`);
      return true;
    }
  } catch (checkErr) {
    console.warn('[Newsletter Dispatch] Warning checking duplicate log:', checkErr);
  }

  const subject = 'Welcome to SOFISAM Strategic Insights';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F2EA; padding: 32px 16px; color: #171717;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #DED7CA; overflow: hidden; box-shadow: 0 4px 12px rgba(40,30,15,0.04);">
        <div style="background-color: #0B0B0D; padding: 24px 32px; border-bottom: 3px solid #C7A46A; text-align: center;">
          <div style="display: inline-block; margin-bottom: 8px;">
            ${getEmailLogoHtml({ width: 130, height: 32, center: true })}
          </div>
          <p style="color: #C7A46A; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0; font-weight: 600;">Strategic Insights & Perspectives</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #171717;">Subscription Confirmed</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #66625B; margin: 0 0 16px 0;">
            You have successfully subscribed to receive quarterly macroeconomic briefs, strategic restructuring insights, and market perspectives from SOFISAM.
          </p>
          <p style="font-size: 12px; color: #66625B; margin: 0; border-top: 1px solid #DED7CA; padding-top: 16px;">
            You may unsubscribe at any time using the link in our publications.
          </p>
        </div>
      </div>
    </div>
  `;

  const SENDER_EMAIL = getSenderEmail();
  const resend = getResendClient();

  const dispatch = await dispatchAndLogEmail({
    recipient: email,
    sender: SENDER_EMAIL,
    subject,
    emailType: 'newsletter_welcome',
    executeSend: () =>
      resend!.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject,
        html,
      }),
  });

  return dispatch.success;
}

export interface TestContactEnquiryOptions {
  recipient?: string;
  data?: Partial<ContactEnquiryEmailData>;
}

export interface TestContactEnquiryResult {
  success: boolean;
  resendEmailId?: string;
  emailLogId?: string;
  recipient: string;
  sender: string;
  subject: string;
  status: 'sent' | 'failed';
  error?: string;
}

/**
 * Dispatches an authentic test contact enquiry admin notification email using the branded template.
 */
export async function sendTestContactEnquiryEmail(
  options?: TestContactEnquiryOptions
): Promise<TestContactEnquiryResult> {
  const SENDER_EMAIL = getSenderEmail();
  const recipient = (options?.recipient?.trim() || getAdminRecipient()).toLowerCase();

  const testPayload: ContactEnquiryEmailData = {
    ...SAMPLE_CONTACT_ENQUIRY,
    ...(options?.data || {}),
    submittedAt: new Date(),
    websiteUrl: process.env.FRONTEND_URL || 'https://sofisam-seven.vercel.app',
  };

  const subject = `New Contact Enquiry | SOFISAM | [TEST] ${testPayload.name}`;
  const html = renderContactEnquiryHtml(testPayload);
  const text = renderContactEnquiryText(testPayload);

  const resend = getResendClient();

  const dispatch = await dispatchAndLogEmail({
    recipient,
    sender: SENDER_EMAIL,
    subject,
    emailType: 'admin_notification',
    relatedEnquiryReference: testPayload.referenceId,
    executeSend: () => {
      if (!resend) {
        throw new Error('Resend client is not initialized (missing or invalid RESEND_API_KEY)');
      }
      return resend.emails.send({
        from: SENDER_EMAIL,
        to: recipient,
        subject,
        html,
        text,
      });
    },
  });

  return {
    success: dispatch.success,
    resendEmailId: dispatch.resendEmailId,
    emailLogId: dispatch.emailLogId,
    recipient,
    sender: SENDER_EMAIL,
    subject,
    status: dispatch.success ? 'sent' : 'failed',
    error: dispatch.error,
  };
}

export interface TestThankYouOptions {
  recipient?: string;
  data?: Partial<ThankYouEmailData>;
}

/**
 * Dispatches an authentic test customer thank-you acknowledgement email using the official architectural template.
 */
export async function sendTestThankYouEmail(
  options?: TestThankYouOptions
): Promise<TestContactEnquiryResult> {
  const SENDER_EMAIL = getSenderEmail();
  const recipient = (options?.recipient?.trim() || getAdminRecipient()).toLowerCase();

  const testPayload: ThankYouEmailData = {
    ...SAMPLE_THANK_YOU_EMAIL,
    ...(options?.data || {}),
    submittedAt: new Date(),
    websiteUrl: process.env.FRONTEND_URL || 'https://sofisam-seven.vercel.app',
  };

  const subject = `[TEST] Thank You for Your Enquiry | SOFISAM | ${testPayload.referenceId}`;
  const html = renderThankYouEmailHtml(testPayload);
  const text = renderThankYouEmailText(testPayload);

  const resend = getResendClient();

  const dispatch = await dispatchAndLogEmail({
    recipient,
    sender: SENDER_EMAIL,
    subject,
    emailType: 'customer_acknowledgement',
    relatedEnquiryReference: testPayload.referenceId,
    executeSend: () => {
      if (!resend) {
        throw new Error('Resend client is not initialized (missing or invalid RESEND_API_KEY)');
      }
      return resend.emails.send({
        from: SENDER_EMAIL,
        to: recipient,
        subject,
        html,
        text,
      });
    },
  });

  return {
    success: dispatch.success,
    resendEmailId: dispatch.resendEmailId,
    emailLogId: dispatch.emailLogId,
    recipient,
    sender: SENDER_EMAIL,
    subject,
    status: dispatch.success ? 'sent' : 'failed',
    error: dispatch.error,
  };
}
