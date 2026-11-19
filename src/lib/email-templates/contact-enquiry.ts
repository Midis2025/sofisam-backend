/**
 * SOFISAM Contact Enquiry Admin Notification Email Template
 *
 * Designed to mirror the exact visual identity and design tokens of the public
 * SOFISAM website (https://sofisam-seven.vercel.app/).
 *
 * Brand Design Tokens Extracted from Website Source:
 * - Canvas Background: #F6F2EA (--void / light paper)
 * - Card Surface:      #FFFFFF / #FBF9F5 (--plate)
 * - Primary Text:      #171717 (Deep Ink / --ivory on light)
 * - Secondary Text:    #66625B (--stone)
 * - Muted Accent:      #625F59 (--sage)
 * - Signature Gold:    #C7A46A (--brass / --gold)
 * - Header Background: #0B0B0D (--char / dark void)
 * - Line / Border:     #DED7CA (--line) / #CDC4B3 (--line-strong)
 * - Fonts:             Newsreader, Georgia, serif (Headings) / Inter, sans-serif (Body)
 */

import { getEmailLogoHtml } from '../email-branding';

export interface ContactEnquiryEmailData {
  referenceId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  organisation?: string | null;
  subject?: string | null;
  areaOfInterest?: string | null;
  message: string;
  submittedAt: Date | string;
  sourcePage?: string | null;
  websiteUrl?: string | null;
}

export const SAMPLE_CONTACT_ENQUIRY: ContactEnquiryEmailData = {
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

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatSubmissionDate(dateVal: Date | string): string {
  try {
    const d = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(d.getTime())) return String(dateVal);
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return String(dateVal);
  }
}

/**
 * Generates the executive-level responsive HTML email template using audited SOFISAM brand tokens.
 */
export function renderContactEnquiryHtml(
  data: ContactEnquiryEmailData,
  options?: { isClientPreview?: boolean; logoUrl?: string }
): string {
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safeRef = escapeHtml(data.referenceId);
  const safeOrg = escapeHtml(data.company || data.organisation || '');
  const safePhone = escapeHtml(data.phone || '');
  const safeSubject = escapeHtml(data.subject || data.areaOfInterest || '');
  const safeSource = escapeHtml(data.sourcePage || '/contact');
  const safeMessage = escapeHtml(data.message);
  const formattedDate = formatSubmissionDate(data.submittedAt);
  const websiteUrl = data.websiteUrl || 'https://sofisam-seven.vercel.app';

  // Mailto reply URL with pre-filled subject
  const replySubject = encodeURIComponent(`Re: SOFISAM Contact Enquiry (${data.referenceId})`);
  const replyMailto = `mailto:${encodeURIComponent(data.email)}?subject=${replySubject}`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>New Contact Enquiry | SOFISAM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F2EA; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; color: #171717;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #F6F2EA; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #DED7CA; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(40, 30, 15, 0.06);">
          
          <!-- Header (Executive Dark Void with Signature Gold Accent) -->
          <tr>
            <td style="background-color: #0B0B0D; padding: 24px 32px; border-bottom: 2px solid #C7A46A;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="middle">
                    <a href="${websiteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      ${getEmailLogoHtml({
                        isClientPreview: options?.isClientPreview,
                        customUrl: options?.logoUrl,
                        width: 150,
                        height: 38,
                      })}
                    </a>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(199, 164, 106, 0.12); border: 1px solid rgba(199, 164, 106, 0.4); color: #C7A46A; font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 5px 12px; border-radius: 4px; font-family: Inter, sans-serif;">
                      NEW CONTACT ENQUIRY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 36px 32px 32px 32px; background-color: #FFFFFF;">
              
              <!-- Main Introduction -->
              <h1 style="font-family: Newsreader, Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 500; color: #171717; margin: 0 0 10px 0; line-height: 1.25; letter-spacing: -0.3px;">
                New Enquiry Received
              </h1>
              <p style="font-size: 13.5px; line-height: 1.6; color: #66625B; margin: 0 0 24px 0;">
                A prospective client has submitted a new enquiry through the SOFISAM website. Please review the information below and follow up directly.
              </p>

              <!-- Enquiry Reference Metadata Strip -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FBF9F5; border: 1px solid #DED7CA; border-radius: 6px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 12px;">
                      <tr>
                        <td style="color: #66625B; padding-bottom: 5px;">Enquiry Reference:</td>
                        <td align="right" style="color: #171717; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 700; padding-bottom: 5px;">
                          ${safeRef}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #66625B; padding-bottom: 5px;">Submission Date &amp; Time:</td>
                        <td align="right" style="color: #171717; font-weight: 500; padding-bottom: 5px;">
                          ${formattedDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #66625B;">Enquiry Source:</td>
                        <td align="right" style="color: #171717; font-weight: 500;">
                          ${safeSource}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Contact Information Section -->
              <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #625F59; margin-bottom: 8px;">
                Contact Details
              </div>

              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1px solid #DED7CA; border-radius: 6px; margin-bottom: 24px; font-size: 13px;">
                <tr>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #66625B; width: 150px;">
                    Name &amp; Title:
                  </td>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #171717; font-weight: 600;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #66625B;">
                    Corporate Email:
                  </td>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #171717; font-weight: 600;">
                    <a href="mailto:${safeEmail}" style="color: #171717; text-decoration: underline;">
                      ${safeEmail}
                    </a>
                  </td>
                </tr>
                ${
                  safePhone
                    ? `<tr>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #66625B;">
                    Phone Number:
                  </td>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #171717;">
                    <a href="tel:${safePhone}" style="color: #171717; text-decoration: none;">
                      ${safePhone}
                    </a>
                  </td>
                </tr>`
                    : ''
                }
                ${
                  safeOrg
                    ? `<tr>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #66625B;">
                    Organisation:
                  </td>
                  <td style="padding: 11px 16px; border-bottom: 1px solid #EEE8DC; color: #171717; font-weight: 500;">
                    ${safeOrg}
                  </td>
                </tr>`
                    : ''
                }
                ${
                  safeSubject
                    ? `<tr>
                  <td style="padding: 11px 16px; color: #66625B;">
                    Area of Interest:
                  </td>
                  <td style="padding: 11px 16px; color: #7A5D33; font-weight: 600;">
                    ${safeSubject}
                  </td>
                </tr>`
                    : ''
                }
              </table>

              <!-- Enquiry Message Section -->
              <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #625F59; margin-bottom: 8px;">
                Enquiry Message
              </div>

              <div style="background-color: #FBF9F5; border: 1px solid #DED7CA; border-left: 3px solid #C7A46A; border-radius: 4px; padding: 18px 20px; margin-bottom: 28px;">
                <p style="font-family: Inter, system-ui, sans-serif; font-size: 13.5px; line-height: 1.65; color: #171717; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
              </div>

              <!-- Primary Call To Action (Reply) -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                <tr>
                  <td align="center">
                    <a href="${replyMailto}" target="_blank" style="display: inline-block; background-color: #171717; color: #FFFFFF; font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; padding: 14px 34px; border-radius: 4px; text-decoration: none; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);">
                      REPLY TO ENQUIRY &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Dashboard Portal Deep Link -->
              <p style="text-align: center; font-size: 11.5px; color: #66625B; margin: 0;">
                Or inspect this mandate inside the
                <a href="https://sofisam-backend.vercel.app/enquiries" style="color: #7A5D33; text-decoration: underline; font-weight: 600;">
                  SOFISAM Admin Dashboard
                </a>
              </p>

            </td>
          </tr>

          <!-- Footer (Corporate Dubai Headquarters) -->
          <tr>
            <td style="background-color: #F6F2EA; padding: 24px 32px; border-top: 1px solid #DED7CA; text-align: center;">
              <p style="font-family: Newsreader, Georgia, serif; font-size: 13px; font-weight: 600; color: #171717; margin: 0 0 4px 0; letter-spacing: 1.2px;">
                SOFISAM FZCO
              </p>
              <p style="font-size: 11px; color: #66625B; margin: 0 0 6px 0; line-height: 1.4;">
                DMCC Business Centre, Jumeirah Lake Towers, Dubai, United Arab Emirates
              </p>
              <p style="font-size: 11.5px; margin: 0 0 12px 0;">
                <a href="${websiteUrl}" style="color: #7A5D33; text-decoration: none; font-weight: 600;">
                  ${websiteUrl}
                </a>
              </p>
              <p style="font-size: 10px; color: #847E75; margin: 0; line-height: 1.5; border-top: 1px solid #E6DFD2; padding-top: 10px;">
                This is an automated notification generated from the SOFISAM website contact form.<br />
                Strictly confidential &bull; Intended solely for authorized SOFISAM executive personnel.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Plain-text alternative fallback matching the audited SOFISAM template.
 */
export function renderContactEnquiryText(data: ContactEnquiryEmailData): string {
  const org = data.company || data.organisation || 'N/A';
  const phone = data.phone || 'N/A';
  const subject = data.subject || data.areaOfInterest || 'General Contact Enquiry';
  const dateStr = formatSubmissionDate(data.submittedAt);
  const websiteUrl = data.websiteUrl || 'https://sofisam-seven.vercel.app';

  return `=======================================================
SOFISAM - NEW CONTACT ENQUIRY RECEIVED
=======================================================

A prospective client has submitted a new enquiry through the SOFISAM website.
Please review the information below and follow up directly.

ENQUIRY DETAILS:
-------------------------------------------------------
Reference ID : ${data.referenceId}
Date & Time  : ${dateStr}
Source       : ${data.sourcePage || '/contact'}

CONTACT DETAILS:
-------------------------------------------------------
Name & Title : ${data.name}
Email        : ${data.email}
Phone        : ${phone}
Organisation : ${org}
Subject      : ${subject}

ENQUIRY MESSAGE:
-------------------------------------------------------
${data.message}

-------------------------------------------------------
Reply directly to: ${data.email}
Admin Dashboard  : https://sofisam-backend.vercel.app/enquiries

SOFISAM FZCO - Strategic Advisory & Consulting
DMCC Business Centre, Jumeirah Lake Towers, Dubai, UAE
Website: ${websiteUrl}
=======================================================`;
}
