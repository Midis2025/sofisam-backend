import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import {
  getAdminRecipient,
  getSenderEmail,
  sendTestContactEnquiryEmail,
  sendTestThankYouEmail,
} from '@/lib/email';
import {
  SAMPLE_CONTACT_ENQUIRY,
  renderContactEnquiryHtml,
  renderContactEnquiryText,
} from '@/lib/email-templates/contact-enquiry';
import {
  SAMPLE_THANK_YOU_EMAIL,
  renderThankYouEmailHtml,
  renderThankYouEmailText,
} from '@/lib/email-templates/thank-you';

export const dynamic = 'force-dynamic';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/admin/emails/test-contact
 * Returns the template definition, sample payload, rendered HTML & plain-text,
 * and current recipient/sender configurations for the preview interface.
 * Supports query param ?template=thank_you | admin
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const templateType = req.nextUrl?.searchParams?.get('template') || 'admin';
    const recipient = getAdminRecipient();
    const sender = getSenderEmail();

    if (templateType === 'thank_you') {
      const samplePayload = SAMPLE_THANK_YOU_EMAIL;
      const html = renderThankYouEmailHtml(samplePayload, { isClientPreview: true });
      const text = renderThankYouEmailText(samplePayload);

      return NextResponse.json({
        success: true,
        template: 'thank_you',
        config: {
          adminRecipient: recipient,
          sender,
          subject: `Thank You for Your Enquiry | SOFISAM | [TEST] ${samplePayload.referenceId}`,
        },
        sampleData: samplePayload,
        renderedHtml: html,
        renderedText: text,
      });
    }

    const samplePayload = SAMPLE_CONTACT_ENQUIRY || {
      referenceId: 'CNT-2026-8821',
      name: 'Dr. Marcus Vance',
      email: 'm.vance@vance-holdings.ch',
      phone: '+41 22 819 4000',
      company: 'Vance Capital & Family Office',
      organisation: 'Vance Capital & Family Office',
      subject: 'Cross-Border Capital Structuring & Restructuring Advisory',
      areaOfInterest: 'Cross-Border Capital Structuring & Restructuring Advisory',
      message:
        'We are currently exploring a strategic recapitalization mandate involving our GCC and European operating assets. We would appreciate an introductory consultation with SOFISAM’s senior advisory principals regarding cross-border governance and fiduciary structuring options.',
      submittedAt: new Date(),
      sourcePage: 'https://sofisam-seven.vercel.app/contact',
      websiteUrl: 'https://sofisam-seven.vercel.app',
    };

    const html = renderContactEnquiryHtml(samplePayload, { isClientPreview: true });
    const text = renderContactEnquiryText(samplePayload);

    return NextResponse.json({
      success: true,
      template: 'admin',
      config: {
        adminRecipient: recipient,
        sender,
        subject: `New Contact Enquiry | SOFISAM | [TEST] ${samplePayload.name}`,
      },
      sampleData: samplePayload,
      renderedHtml: html,
      renderedText: text,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    console.error('[Email Preview] Failed to generate email preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate email template preview' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/emails/test-contact
 * Triggers a live test dispatch of the branded SOFISAM contact notification email.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    let customRecipient: string | undefined;
    let templateTarget: 'admin' | 'thank_you' = 'admin';
    try {
      const body = await req.json();
      if (body && typeof body.template === 'string' && body.template === 'thank_you') {
        templateTarget = 'thank_you';
      }
      if (body && typeof body.recipient === 'string') {
        const trimmed = body.recipient.trim();
        if (trimmed) {
          if (!EMAIL_REGEX.test(trimmed)) {
            return NextResponse.json(
              {
                success: false,
                error: 'Invalid recipient email format. Please provide a valid email address (e.g. name@example.com).',
              },
              { status: 400 }
            );
          }
          customRecipient = trimmed;
        }
      }
    } catch {
      // Body may be empty if no payload was sent, defaults to admin recipient
    }

    const targetRecipient = customRecipient || getAdminRecipient();

    const result =
      templateTarget === 'thank_you'
        ? await sendTestThankYouEmail({ recipient: targetRecipient })
        : await sendTestContactEnquiryEmail({ recipient: targetRecipient });

    if (!result.success) {
      let diagnosticHint = '';
      if (result.error?.includes('only send testing emails to your own email address')) {
        diagnosticHint = 'Resend is using onboarding@resend.dev which only allows sending to the registered account owner email. To send to any other address, verify your domain in Resend.';
      } else if (result.error?.includes('domain is not verified')) {
        diagnosticHint = 'The sender domain is not verified in Resend. Please complete DNS records in Resend dashboard.';
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to dispatch test email through Resend',
          hint: diagnosticHint || undefined,
          data: {
            recipient: result.recipient,
            sender: result.sender,
            subject: result.subject,
            emailLogId: result.emailLogId,
            status: result.status,
            initiatedBy: admin.email,
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test contact enquiry notification dispatched successfully via Resend',
      data: {
        resendEmailId: result.resendEmailId,
        emailLogId: result.emailLogId,
        recipient: result.recipient,
        sender: result.sender,
        subject: result.subject,
        status: result.status,
        dispatchedAt: new Date().toISOString(),
        initiatedBy: admin.email,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized: Admin authentication required' }, { status: 401 });
    }
    console.error('[Test Contact Email] Uncaught error during test email processing:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing test email' },
      { status: 500 }
    );
  }
}
