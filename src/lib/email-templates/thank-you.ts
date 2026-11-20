/**
 * SOFISAM FZCO — Client Thank-You / Acknowledgement Email Template
 *
 * Exact recreation of the official architectural template from src/templates/email-template.html
 * based on Figma design tokens:
 * - Dubai skyline hero background (Cloudinary CDN)
 * - Official white SOFISAM brandmark (Cloudinary CDN)
 * - Warm paper ground (#F6F2EA) & lifted sand ground (#EEE8DC)
 * - Newsreader Editorial Serif & Inter Sans typography
 * - Dark CTAs & DMCC world headquarters footer
 */

import { getEmailLogoHtml } from '../email-branding';

export interface ThankYouEmailData {
  name: string;
  email: string;
  referenceId: string;
  enquiryType?: string | null;
  organisation?: string | null;
  areaOfInterest?: string | null;
  submittedAt?: Date | string;
  websiteUrl?: string;
}

export interface ThankYouEmailOptions {
  isClientPreview?: boolean;
  logoUrl?: string;
}

export const SAMPLE_THANK_YOU_EMAIL: ThankYouEmailData = {
  name: 'Dr. Marcus Vance',
  email: 'm.vance@vance-holdings.ch',
  referenceId: 'ENQ-2026-8821',
  enquiryType: 'Private Office Mandate',
  organisation: 'Vance Capital & Family Office',
  areaOfInterest: 'Cross-Border Capital Structuring & Restructuring Advisory',
  submittedAt: new Date(),
  websiteUrl: 'https://sofisam-seven.vercel.app',
};

function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderThankYouEmailHtml(
  data: ThankYouEmailData,
  options?: ThankYouEmailOptions
): string {
  const safeName = escapeHtml(data.name || 'Client');
  const safeRef = escapeHtml(data.referenceId);
  const safeType = escapeHtml(data.enquiryType || data.areaOfInterest || 'Mandate Enquiry');
  const safeOrg = escapeHtml(data.organisation || '');
  const websiteUrl = data.websiteUrl || 'https://sofisam-seven.vercel.app';

  // In client preview or webmail, world map and logos use reliable HTTPS CDN assets
  const heroBgUrl =
    'https://res.cloudinary.com/dntahkr0a/image/upload/v1795159174/hero-dubai-poster_gvoflt.webp';
  const logoDarkUrl = 'https://sofisam-seven.vercel.app/logo-dark.png';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Thank You for Your Enquiry | SOFISAM</title>
  
  <!-- Typography (SOFISAM Brand: Newsreader Editorial Serif & Inter Sans) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet" />

  <style type="text/css">
    /* Client Resets */
    body, p, h1, h2, h3, h4, h5, h6 {
      margin: 0;
      padding: 0;
    }
    body {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background-color: #E8E3DA;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
      display: block;
    }
    a {
      text-decoration: none;
    }

    /* Core Palette Tokens */
    :root {
      --void: #F6F2EA;
      --char: #EEE8DC;
      --dark-void: #0B0B0D;
      --ink: #171717;
      --gold: #C7A46A;
      --gold-deep: #7A5D33;
      --bronze: #9E7949;
      --secondary: #66625B;
      --line: #DED7CA;
    }

    /* Typography Classes */
    .font-serif {
      font-family: 'Newsreader', Georgia, 'Times New Roman', serif;
    }
    .font-sans {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    /* Interactive States */
    .cta-button {
      transition: background-color 0.25s ease, transform 0.2s ease;
    }
    .cta-button:hover {
      background-color: #2A2A2E !important;
    }
    .footer-cta {
      transition: background-color 0.25s ease;
    }
    .footer-cta:hover {
      background-color: #2A2A2E !important;
    }
    .text-link:hover {
      color: #C7A46A !important;
    }

    /* Responsive Media Queries */
    @media only screen and (max-width: 680px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .hero-pad,
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .headline-text {
        font-size: 28px !important;
        line-height: 1.15 !important;
      }
      .eyebrow-text {
        font-size: 11px !important;
      }
      .body-heading {
        font-size: 20px !important;
      }
      .body-copy {
        font-size: 15px !important;
      }
      .button-wrapper {
        display: block !important;
        width: 100% !important;
        margin-bottom: 12px !important;
      }
      .button-cell {
        display: block !important;
        width: 100% !important;
      }
      .button-link {
        display: block !important;
        text-align: center !important;
        padding: 13px 18px !important;
      }
      .footer-top-left, .footer-top-right {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
      }
      .footer-top-right {
        margin-top: 18px !important;
      }
      .footer-contact-row {
        text-align: left !important;
      }
      .reach-left, .reach-right {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
      }
      .reach-right {
        margin-top: 8px !important;
      }
      .copyright-left, .copyright-right {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
      }
      .copyright-right {
        margin-top: 6px !important;
      }
    }
  </style>

  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, span { font-family: Georgia, 'Times New Roman', serif !important; }
    .font-sans, .cta-button, .footer-cta { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>

<body style="margin: 0; padding: 0; background-color: #E8E3DA; font-family: 'Newsreader', Georgia, serif; color: #171717; -webkit-font-smoothing: antialiased;">

  <!-- Outer Canvas Table -->
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #E8E3DA; width: 100%; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 36px 12px;">
        
        <!-- Main Email Card (Exact 680px Width from Design) -->
        <table class="email-container" width="680" border="0" cellpadding="0" cellspacing="0" style="width: 680px; max-width: 680px; background-color: #F6F2EA; border-collapse: separate; overflow: hidden; box-shadow: 0 12px 40px rgba(23, 23, 23, 0.12); margin: 0 auto;">
          
          <!-- ========================================================
               1. HERO SECTION (DUBAI SKYLINE & BRAND STATEMENT)
               ======================================================== -->
          <tr>
            <td style="padding: 0; position: relative; background-color: #080C10; height: 383px;">
              
              <!-- Background Image Table with Outlook Fallback -->
              <table width="100%" height="383" border="0" cellpadding="0" cellspacing="0" style="width: 100%; height: 383px; background-color: #080C10; background-image: url('${heroBgUrl}'); background-size: cover; background-position: center top; background-repeat: no-repeat;">
                <tr>
                  <!-- Sophisticated Directional Scrim Overlay (Matches PDF Twilight Lighting) -->
                  <td valign="top" style="height: 383px; background: linear-gradient(90deg, rgba(7,11,16,0.85) 0%, rgba(7,11,16,0.62) 48%, rgba(7,11,16,0.20) 80%, rgba(7,11,16,0.40) 100%), linear-gradient(180deg, rgba(10,20,32,0.60) 0%, rgba(8,14,22,0.25) 35%, rgba(6,10,14,0.70) 75%, rgba(5,8,12,0.95) 100%);">
                    
                    <!-- Inner Hero Table -->
                    <table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; height: 100%;">
                      
                      <!-- Top Row: SOFISAM FZCO Logo (Crisp White Brandmark) -->
                      <tr>
                        <td class="hero-pad" align="left" valign="top" style="padding: 32px 42px 22px 42px;">
                          <a href="${websiteUrl}" target="_blank" style="display: inline-block; text-decoration: none;">
                            ${getEmailLogoHtml({
                              isClientPreview: options?.isClientPreview,
                              customUrl: options?.logoUrl,
                              width: 160,
                              height: 40,
                            })}
                          </a>
                        </td>
                      </tr>

                      <!-- Sub-Header Hairline Divider -->
                      <tr>
                        <td class="hero-pad" style="padding: 0 42px 28px 42px;">
                          <div style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.16); line-height: 1px; font-size: 1px;">&nbsp;</div>
                        </td>
                      </tr>

                      <!-- Middle Row: Eyebrow Tagline -->
                      <tr>
                        <td class="hero-pad" align="left" valign="top" style="padding: 0 42px 14px 42px;">
                          <table border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td valign="middle" style="padding-right: 10px;">
                                <div style="width: 18px; height: 1.5px; background-color: #C7A46A; line-height: 1px; font-size: 1px;">&nbsp;</div>
                              </td>
                              <td valign="middle">
                                <span class="font-sans eyebrow-text" style="font-family: 'Inter', -apple-system, sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #C7A46A; display: inline-block;">
                                  DUBAI &middot; GLOBAL ADVISORY
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Middle Row: Dominant Statement Headline -->
                      <tr>
                        <td class="hero-pad" align="left" valign="top" style="padding: 0 42px 75px 42px;">
                          <h1 class="font-serif headline-text" style="font-family: 'Newsreader', Georgia, serif; font-size: 38px; line-height: 1.14; font-weight: 400; color: #FFFFFF; letter-spacing: -0.018em; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">
                            Strategic clarity<br />for a changing world.
                          </h1>
                        </td>
                      </tr>

                      <!-- Bottom Row: Thin Separator Rule -->
                      <tr>
                        <td class="hero-pad" style="padding: 0 42px 14px 42px;">
                          <div style="width: 100%; height: 1px; background-color: rgba(255, 255, 255, 0.18); line-height: 1px; font-size: 1px;">&nbsp;</div>
                        </td>
                      </tr>

                      <!-- Bottom Row: Global Platform Metadata Strip -->
                      <tr>
                        <td class="hero-pad" align="left" valign="middle" style="padding: 0 42px 24px 42px;">
                          <p class="font-sans" style="font-family: 'Inter', -apple-system, sans-serif; font-size: 9.5px; line-height: 1.4; letter-spacing: 0.12em; text-transform: uppercase; margin: 0;">
                            <span style="color: #C7A46A; font-weight: 700; margin-right: 6px;">GLOBAL PLATFORM:</span>
                            <span style="color: rgba(255, 255, 255, 0.88); font-weight: 500;">
                              DUBAI &nbsp;&middot;&nbsp; MIDDLE EAST &nbsp;&middot;&nbsp; EUROPE &nbsp;&middot;&nbsp; ASIA &nbsp;&middot;&nbsp; AMERICAS
                            </span>
                          </p>
                        </td>
                      </tr>

                    </table>
                    <!-- /Inner Hero Padding Container -->

                  </td>
                </tr>
              </table>
              <!-- /Background Image Table -->

            </td>
          </tr>

          <!-- ========================================================
               2. MAIN BODY SECTION (ENQUIRY CONFIRMATION)
               ======================================================== -->
          <tr>
            <td class="mobile-padding" style="padding: 44px 42px 42px 42px; background-color: #F6F2EA; position: relative;">
              
              <!-- Section Heading -->
              <h2 class="font-serif body-heading" style="font-family: 'Newsreader', Georgia, serif; font-size: 23px; line-height: 1.25; font-weight: 600; color: #9E7949; letter-spacing: -0.01em; margin: 0 0 28px 0;">
                Thank You for Your Enquiry | SOFISAM
              </h2>

              <!-- Salutation -->
              <p class="font-serif body-copy" style="font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.68; color: #171717; margin: 0 0 18px 0;">
                Dear ${safeName},
              </p>

              <!-- Acknowledgement Paragraph 1 -->
              <p class="font-serif body-copy" style="font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.68; color: #171717; margin: 0 0 18px 0;">
                Thank you for contacting <strong style="color: #9E7949; font-weight: 600;">SOFISAM</strong>.
              </p>

              <!-- Acknowledgement Paragraph 2 -->
              <p class="font-serif body-copy" style="font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.68; color: #171717; margin: 0 0 18px 0;">
                We have successfully received your enquiry. Our team will review your message and get back to you shortly.
              </p>

              <!-- Submission Reference Card -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #EEE8DC; border: 1px solid #DED7CA; border-left: 3px solid #9E7949; border-radius: 4px; margin: 24px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-family: 'Inter', -apple-system, sans-serif;">
                      <tr>
                        <td style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #7A5D33; padding-bottom: 6px;">
                          SUBMISSION REFERENCE
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: monospace, monospace; font-size: 14px; font-weight: 700; color: #171717; padding-bottom: 4px;">
                          ${safeRef}
                        </td>
                      </tr>
                      ${safeType ? `<tr><td style="font-size: 11.5px; color: #66625B; padding-top: 2px;">Enquiry Type: <strong style="color: #171717;">${safeType}</strong></td></tr>` : ''}
                      ${safeOrg ? `<tr><td style="font-size: 11.5px; color: #66625B; padding-top: 2px;">Organisation: <strong style="color: #171717;">${safeOrg}</strong></td></tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Acknowledgement Paragraph 3 -->
              <p class="font-serif body-copy" style="font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.68; color: #171717; margin: 0 0 24px 0;">
                We appreciate your interest and look forward to connecting with you.
              </p>

              <!-- Sign-off Block -->
              <div style="margin-bottom: 30px;">
                <p class="font-serif body-copy" style="font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.68; color: #171717; margin: 0 0 4px 0;">
                  Best regards,
                </p>
                <p class="font-serif" style="font-family: 'Newsreader', Georgia, serif; font-size: 16px; line-height: 1.4; color: #9E7949; font-weight: 600; margin: 0 0 4px 0;">
                  Team SOFISAM
                </p>
                <p class="font-serif" style="font-family: 'Newsreader', Georgia, serif; font-size: 15px; line-height: 1.4; color: #171717; margin: 0;">
                  International Strategic Consulting &amp; Advisory
                </p>
              </div>

              <!-- Two Executive Action Buttons -->
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Button 1: info@sofisam.com -->
                  <td class="button-cell" style="padding-right: 12px; padding-bottom: 8px;">
                    <a href="mailto:info@sofisam.com" class="cta-button font-sans button-link" style="display: inline-block; background-color: #171717; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 700; text-decoration: none; padding: 12px 22px; border-radius: 2px; letter-spacing: 0.02em; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.18);">
                      info@sofisam.com &nbsp;<span style="font-size: 13px; display: inline-block; vertical-align: middle;">&#x2197;</span>
                    </a>
                  </td>

                  <!-- Button 2: www.sofisam.com -->
                  <td class="button-cell" style="padding-bottom: 8px;">
                    <a href="${websiteUrl}" target="_blank" class="cta-button font-sans button-link" style="display: inline-block; background-color: #171717; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 700; text-decoration: none; padding: 12px 22px; border-radius: 2px; letter-spacing: 0.02em; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.18);">
                      www.sofisam.com &nbsp;<span style="font-size: 13px; display: inline-block; vertical-align: middle;">&#x2197;</span>
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ========================================================
               3. FOOTER SECTION (ARCHITECTURAL HEADQUARTERS & DETAILS)
               ======================================================== -->
          <tr>
            <td class="mobile-padding" style="padding: 32px 42px 24px 42px; background-color: #EEE8DC; border-top: 1px solid #DED7CA;">
              
              <!-- Footer Top Bar: Brand, Statement & Action -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <!-- Left: Dark Brandmark & Firm Statement -->
                  <td class="footer-top-left" align="left" valign="top" style="padding-bottom: 22px;">
                    <a href="${websiteUrl}" target="_blank" style="display: inline-block; text-decoration: none;">
                      <img src="${logoDarkUrl}" alt="SOFISAM FZCO" width="148" height="37" style="width: 148px; height: 37px; display: block; border: 0;" />
                    </a>
                    <p class="font-sans" style="font-family: 'Inter', sans-serif; font-size: 11px; line-height: 1.45; color: #363430; margin: 10px 0 3px 0;">
                      International Strategic Consulting, Advisory and Structuring Firm.
                    </p>
                    <p class="font-sans" style="font-family: 'Inter', sans-serif; font-size: 10.5px; line-height: 1.4; color: #9E7949; font-weight: 600; margin: 0;">
                      World Headquarters &middot; Dubai Multi Commodities Centre
                    </p>
                  </td>

                  <!-- Right: "Get in Touch" Button & Direct Channels -->
                  <td class="footer-top-right" align="right" valign="top" style="padding-bottom: 22px;">
                    <div style="display: inline-block;">
                      <a href="${websiteUrl}/contact" target="_blank" class="footer-cta font-sans" style="display: inline-block; background-color: #171717; color: #FFFFFF; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; text-decoration: none; padding: 10px 22px; border-radius: 2px; text-transform: none; letter-spacing: 0.02em; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
                        Get in Touch
                      </a>
                    </div>
                    <div class="footer-contact-row font-sans" style="font-family: 'Inter', sans-serif; font-size: 10.5px; color: #363430; font-weight: 500; margin-top: 10px;">
                      <a href="mailto:info@sofisam.com" style="color: #363430; text-decoration: none;">
                        <span style="color: #9E7949; margin-right: 3px;">&#x2709;</span> info@sofisam.com
                      </a>
                      <span style="color: #CDC4B3; margin: 0 8px;">|</span>
                      <a href="tel:+971503885475" style="color: #363430; text-decoration: none;">
                        <span style="color: #9E7949; margin-right: 3px;">&#x260E;</span> +971 50 388 5475
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Footer Middle: World Headquarters Legal Entity Data -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td align="left" valign="top">
                    <p class="font-sans" style="font-family: 'Inter', sans-serif; font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #7A5D33; margin: 0 0 6px 0;">
                      WORLD HEADQUARTERS
                    </p>
                    <p class="font-sans" style="font-family: 'Inter', sans-serif; font-size: 10.5px; font-weight: 700; line-height: 1.5; color: #171717; margin: 0;">
                      SOFISAM FZCO
                    </p>
                    <p class="font-sans" style="font-family: 'Inter', sans-serif; font-size: 10px; line-height: 1.5; color: #363430; margin: 0;">
                      DMCC BUSINESS CENTRE, JEWELLERY &amp; GEMPLEX 3
                    </p>
                    <p class="font-sans" style="font-family: 'Inter', sans-serif; font-size: 10px; line-height: 1.5; color: #363430; margin: 0;">
                      JUMEIRAH LAKE TOWERS, DUBAI 500001, UAE
                    </p>
                    <p class="font-sans" style="font-family: 'Inter', sans-serif; font-size: 10px; line-height: 1.5; color: #363430; margin: 0;">
                      PO BOX 334355
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Thin Hairline Divider -->
              <div style="width: 100%; height: 1px; background-color: #D8D0C3; line-height: 1px; font-size: 1px; margin-bottom: 14px;">&nbsp;</div>

              <!-- Footer Lower Row: International Reach Bar -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 14px;">
                <tr>
                  <!-- Left: International Reach Label -->
                  <td class="reach-left font-sans" align="left" valign="middle">
                    <span style="color: #C7A46A; font-size: 11px; margin-right: 4px; vertical-align: middle;">&bull;</span>
                    <span style="font-size: 9.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #66625B;">
                      INTERNATIONAL REACH
                    </span>
                  </td>

                  <!-- Right: Regional Hub Indicators -->
                  <td class="reach-right font-sans" align="right" valign="middle">
                    <span style="font-size: 9.5px; letter-spacing: 0.1em; text-transform: uppercase;">
                      <strong style="color: #7A5D33; font-weight: 700;">DUBAI HEADQUARTERS</strong>
                      <span style="color: #B5AEA4; margin: 0 5px;">&middot;</span>
                      <span style="color: #66625B; font-weight: 500;">MIDDLE EAST</span>
                      <span style="color: #B5AEA4; margin: 0 5px;">&middot;</span>
                      <span style="color: #66625B; font-weight: 500;">EUROPE</span>
                      <span style="color: #B5AEA4; margin: 0 5px;">&middot;</span>
                      <span style="color: #66625B; font-weight: 500;">ASIA</span>
                      <span style="color: #B5AEA4; margin: 0 5px;">&middot;</span>
                      <span style="color: #66625B; font-weight: 500;">AMERICAS</span>
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Thin Hairline Divider -->
              <div style="width: 100%; height: 1px; background-color: #D8D0C3; line-height: 1px; font-size: 1px; margin-bottom: 14px;">&nbsp;</div>

              <!-- Footer Bottom: Copyright & Jurisdiction -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td class="copyright-left font-sans" align="left" valign="middle" style="font-family: 'Inter', sans-serif; font-size: 9.5px; color: #66625B;">
                    &copy; ${new Date().getFullYear()} SOFISAM FZCO. All rights reserved.
                  </td>
                  <td class="copyright-right font-sans" align="right" valign="middle" style="font-family: 'Inter', sans-serif; font-size: 9.5px; color: #66625B;">
                    Dubai, United Arab Emirates
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
        <!-- /Main Email Card -->

      </td>
    </tr>
  </table>
  <!-- /Outer Canvas Table -->

</body>
</html>`.trim();
}

export function renderThankYouEmailText(data: ThankYouEmailData): string {
  const name = data.name || 'Client';
  const ref = data.referenceId;
  const type = data.enquiryType || data.areaOfInterest || 'Mandate Enquiry';
  const org = data.organisation;

  return `SOFISAM FZCO — Strategic clarity for a changing world.
======================================================
DUBAI · GLOBAL ADVISORY

Thank You for Your Enquiry | SOFISAM

Dear ${name},

Thank you for contacting SOFISAM.

We have successfully received your enquiry. Our team will review your message and get back to you shortly.

Submission Details:
- Reference ID: ${ref}
- Enquiry Type: ${type}
${org ? `- Organisation: ${org}\n` : ''}
We appreciate your interest and look forward to connecting with you.

Best regards,
Team SOFISAM
International Strategic Consulting & Advisory

Direct Channels:
- Email: info@sofisam.com
- Website: https://www.sofisam.com
- Telephone: +971 50 388 5475

World Headquarters:
SOFISAM FZCO
DMCC Business Centre, Jewellery & Gemplex 3
Jumeirah Lake Towers, Dubai 500001, UAE
PO Box 334355

© ${new Date().getFullYear()} SOFISAM FZCO. All rights reserved.
Dubai, United Arab Emirates
`.trim();
}
