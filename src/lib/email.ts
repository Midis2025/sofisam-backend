import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'SOFISAM <onboarding@resend.dev>';
const ADMIN_RECIPIENT = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@sofisam.com';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface SendEnquiryEmailsArgs {
  referenceId: string;
  formType: 'private_enquiry' | 'contact';
  name: string;
  email: string;
  organisation?: string;
  areaOfInterest?: string;
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

  if (!resend) {
    console.log('[Email Service] RESEND_API_KEY is not configured. Email delivery skipped.');
    return result;
  }

  const isPrivate = args.formType === 'private_enquiry';
  const typeLabel = isPrivate ? 'Private Office Mandate' : 'General Contact Enquiry';

  // 1. Admin Notification Email
  try {
    const adminHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F7F9; padding: 32px 16px; color: #182536;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E9EF; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <div style="background-color: #14243A; padding: 24px 32px; border-bottom: 3px solid #B99A62;">
            <h1 style="color: #FFFFFF; font-family: Georgia, serif; font-size: 22px; margin: 0; letter-spacing: 1px;">SOFISAM</h1>
            <p style="color: #B99A62; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0; font-weight: 600;">Executive Mandate Notification</p>
          </div>
          <div style="padding: 32px;">
            <div style="display: inline-block; background-color: #F8F5EE; border: 1px solid #DFD3BD; color: #8D703D; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 6px; text-transform: uppercase; margin-bottom: 20px;">
              ${escapeHtml(typeLabel)}
            </div>
            <h2 style="font-size: 18px; margin: 0 0 16px 0; color: #182536;">New Submission: ${escapeHtml(args.referenceId)}</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <tr>
                <td style="padding: 8px 0; color: #7C8795; width: 140px; border-bottom: 1px solid #F0F2F5;">Client / Principal:</td>
                <td style="padding: 8px 0; color: #182536; font-weight: 600; border-bottom: 1px solid #F0F2F5;">${escapeHtml(args.name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7C8795; border-bottom: 1px solid #F0F2F5;">Email Address:</td>
                <td style="padding: 8px 0; color: #182536; border-bottom: 1px solid #F0F2F5;"><a href="mailto:${escapeHtml(args.email)}" style="color: #14243A; text-decoration: underline;">${escapeHtml(args.email)}</a></td>
              </tr>
              ${args.organisation ? `
              <tr>
                <td style="padding: 8px 0; color: #7C8795; border-bottom: 1px solid #F0F2F5;">Organisation:</td>
                <td style="padding: 8px 0; color: #182536; border-bottom: 1px solid #F0F2F5;">${escapeHtml(args.organisation)}</td>
              </tr>` : ''}
              ${args.areaOfInterest ? `
              <tr>
                <td style="padding: 8px 0; color: #7C8795; border-bottom: 1px solid #F0F2F5;">Area of Interest:</td>
                <td style="padding: 8px 0; color: #B99A62; font-weight: 600; border-bottom: 1px solid #F0F2F5;">${escapeHtml(args.areaOfInterest)}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #7C8795; border-bottom: 1px solid #F0F2F5;">Source Page:</td>
                <td style="padding: 8px 0; color: #7C8795; border-bottom: 1px solid #F0F2F5;">${escapeHtml(args.sourcePage)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #7C8795;">Submission Time:</td>
                <td style="padding: 8px 0; color: #182536;">${new Date(args.submittedAt).toUTCString()}</td>
              </tr>
            </table>

            <div style="background-color: #F8F9FB; border: 1px solid #E5E9EF; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7C8795; margin: 0 0 8px 0; font-weight: 700;">Client Message</p>
              <p style="font-family: Georgia, serif; font-size: 14px; line-height: 1.6; color: #182536; margin: 0; white-space: pre-wrap;">${escapeHtml(args.message)}</p>
            </div>

            <div style="text-align: center; padding-top: 12px;">
              <a href="https://sofisam-backend.vercel.app/enquiries" style="display: inline-block; background-color: #14243A; color: #FFFFFF; font-size: 13px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Review in Admin Dashboard</a>
            </div>
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: ADMIN_RECIPIENT,
      subject: `[SOFISAM] New ${typeLabel}: ${args.name} (${args.referenceId})`,
      html: adminHtml,
    });

    result.adminNotification = 'sent';
  } catch (err) {
    console.error('[Email Service] Admin notification failed:', err);
    result.adminNotification = 'failed';
  }

  // 2. Customer Acknowledgement Email
  try {
    const customerHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F7F9; padding: 32px 16px; color: #182536;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E9EF; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <div style="background-color: #14243A; padding: 28px 32px; border-bottom: 3px solid #B99A62; text-align: center;">
            <h1 style="color: #FFFFFF; font-family: Georgia, serif; font-size: 24px; margin: 0; letter-spacing: 2px;">SOFISAM</h1>
            <p style="color: #B99A62; font-size: 11px; text-transform: uppercase; letter-spacing: 2.5px; margin: 6px 0 0 0; font-weight: 600;">International Strategic Consulting & Advisory</p>
          </div>
          <div style="padding: 36px 32px;">
            <p style="font-size: 15px; margin: 0 0 16px 0; color: #182536;">Dear ${escapeHtml(args.name)},</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0 0 16px 0;">
              Thank you for contacting SOFISAM. We have received your ${isPrivate ? 'private office mandate inquiry' : 'inquiry'} under confidential reference <strong style="color: #14243A;">${escapeHtml(args.referenceId)}</strong>.
            </p>

            <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0 0 24px 0;">
              Our principals handle every strategic inquiry in strict confidence. A designated member of our advisory team will review your requirements and reach out to you directly.
            </p>

            <div style="background-color: #FBF8F2; border: 1px solid #DFD3BD; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
              <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8D703D; margin: 0 0 8px 0; font-weight: 700;">Submission Reference</p>
              <div style="font-family: monospace; font-size: 13px; color: #14243A; margin-bottom: 6px;">Reference ID: <strong>${escapeHtml(args.referenceId)}</strong></div>
              ${args.areaOfInterest ? `<div style="font-size: 12px; color: #7C8795;">Area of Interest: ${escapeHtml(args.areaOfInterest)}</div>` : ''}
            </div>

            <p style="font-size: 12px; line-height: 1.5; color: #7C8795; margin: 0; border-top: 1px solid #E5E9EF; padding-top: 20px;">
              SOFISAM FZCO &bull; DMCC Business Centre, Jumeirah Lake Towers, Dubai, UAE.<br />
              This communication and any attachments are confidential and intended solely for the recipient.
            </p>
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: args.email,
      subject: `Confirmation: SOFISAM Mandate ${args.referenceId}`,
      html: customerHtml,
    });

    result.customerAcknowledgement = 'sent';
  } catch (err) {
    console.error('[Email Service] Customer acknowledgement failed:', err);
    result.customerAcknowledgement = 'failed';
  }

  return result;
}

export async function sendNewsletterConfirmation(email: string): Promise<boolean> {
  if (!resend) {
    console.log('[Email Service] RESEND_API_KEY not configured. Newsletter confirmation skipped.');
    return false;
  }

  try {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F7F9; padding: 32px 16px; color: #182536;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E9EF; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <div style="background-color: #14243A; padding: 24px 32px; border-bottom: 3px solid #B99A62; text-align: center;">
            <h1 style="color: #FFFFFF; font-family: Georgia, serif; font-size: 22px; margin: 0; letter-spacing: 2px;">SOFISAM</h1>
            <p style="color: #B99A62; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0; font-weight: 600;">Strategic Insights & Perspectives</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="font-size: 18px; margin: 0 0 12px 0; color: #182536;">Subscription Confirmed</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0 0 16px 0;">
              You have successfully subscribed to receive quarterly macroeconomic briefs, strategic restructuring insights, and market perspectives from SOFISAM.
            </p>
            <p style="font-size: 12px; color: #7C8795; margin: 0; border-top: 1px solid #E5E9EF; padding-top: 16px;">
              You may unsubscribe at any time using the link in our publications.
            </p>
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: SENDER_EMAIL,
      to: email,
      subject: 'Welcome to SOFISAM Strategic Insights',
      html,
    });

    return true;
  } catch (err) {
    console.error('[Email Service] Newsletter confirmation failed:', err);
    return false;
  }
}
