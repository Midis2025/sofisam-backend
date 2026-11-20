import { SOFISAM_BRAND, SOFISAM_WHITE_LOGO_BASE64 } from './branding';

export interface EmailLogoOptions {
  isClientPreview?: boolean;
  width?: number;
  height?: number;
  center?: boolean;
  customUrl?: string;
  className?: string;
}

/**
 * Returns the HTML <img> tag for SOFISAM's official white logo in email templates.
 * 
 * - When `isClientPreview: true` (e.g. inside dashboard preview iframe), it renders
 *   the self-contained base64 data URI so it loads instantly in any client or iframe without
 *   relative path or origin issues.
 * - When `isClientPreview: false` (e.g. live email dispatch), it renders `cid:sofisam-logo-white`
 *   which binds to the inline MIME attachment for zero-dependency rendering in Gmail, Apple Mail, and Outlook.
 */
export function getEmailLogoHtml(options: EmailLogoOptions = {}): string {
  const {
    isClientPreview = false,
    width = SOFISAM_BRAND.logo.width,
    height = SOFISAM_BRAND.logo.height,
    center = false,
    customUrl,
  } = options;

  let src = customUrl || SOFISAM_BRAND.assets.logoWhiteHttpsUrl;
  if (isClientPreview) {
    src = SOFISAM_WHITE_LOGO_BASE64;
  }

  const marginStyle = center ? 'margin: 0 auto;' : 'margin: 0;';

  return `
    <img
      src="${src}"
      alt="${SOFISAM_BRAND.logo.alt}"
      width="${width}"
      height="${height}"
      style="display: block; border: 0; outline: none; height: ${height}px; width: ${width}px; max-width: ${width}px; ${marginStyle} font-family: Newsreader, Georgia, 'Times New Roman', serif; font-size: 19px; font-weight: 700; color: #FFFFFF; letter-spacing: 1.5px; text-decoration: none;"
    />
  `.trim();
}

/**
 * Returns the Resend/Nodemailer compatible inline attachment object
 * with Content-ID `sofisam-logo-white`.
 * Derived directly from the bundled base64 logo without requiring Node.js 'fs'
 * or 'path', ensuring full compatibility across both client bundles and server runtimes.
 */
export function getEmailLogoAttachment() {
  const base64Data = SOFISAM_WHITE_LOGO_BASE64.replace(/^data:image\/png;base64,/, '');
  const content = typeof Buffer !== 'undefined' ? Buffer.from(base64Data, 'base64') : base64Data;

  return {
    filename: 'sofisam-logo-white.png',
    content,
    cid: 'sofisam-logo-white',
  };
}
