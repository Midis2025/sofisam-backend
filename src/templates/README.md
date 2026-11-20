# SOFISAM FZCO — Email Templates

Exact recreation of official **SOFISAM FZCO** email templates built with clean, responsive HTML and internal CSS based on the Figma-exported designs.

---

## 📁 Project Structure

```
sofisam templates/
├── assets/
│   ├── hero-skyline.jpg               # Optimized Dubai skyline hero background (Burj Khalifa dusk)
│   ├── hero-skyline-pdf.png           # Original high-res hero extracted from PDF
│   ├── world-map.png                  # Subtle watermark world map
│   ├── logo-white-pdf.png             # Official SOFISAM white brandmark (Header)
│   └── logo-dark-pdf.png              # Official SOFISAM dark brandmark (Footer & Admin Header)
│
├── email-template.html                # 1. Client Enquiry Acknowledgement Template (local assets)
├── email-template-inline.html         # 1. Client Enquiry Acknowledgement (100% self-contained Base64)
│
├── admin-enquiry-email.html           # 2. Internal Admin Notification Template (local assets)
├── admin-enquiry-email-inline.html    # 2. Internal Admin Notification (100% self-contained Base64)
│
├── index.html                         # Browser preview of Client Acknowledgement template
└── README.md                          # Documentation
```

---

## 📧 Available Templates

### 1. Client Enquiry Acknowledgement (`email-template.html` / `email-template-inline.html`)
- **Purpose**: Sent automatically to prospective clients / partners who submit an enquiry through the website.
- **Hero Image**: Hosted directly via Cloudinary CDN (`https://res.cloudinary.com/dntahkr0a/image/upload/v1795159174/hero-dubai-poster_gvoflt.webp`) for rapid, reliable delivery across all email clients.
- **Brandmark Logo**: Hosted directly via Cloudinary CDN (`https://res.cloudinary.com/dntahkr0a/image/upload/v1795159231/logo-white-pdf_ftphqn.png`).
- **Header**: High-impact Dubai skyline hero featuring Burj Khalifa with official white SOFISAM logo, gold eyebrow (`— DUBAI · GLOBAL ADVISORY`), headline (`Strategic clarity for a changing world.`), and global reach strip (`GLOBAL PLATFORM: DUBAI · MIDDLE EAST · EUROPE · ASIA · AMERICAS`).
- **Body**: Warm paper ground (`#F6F2EA`) with subtle world map watermark, bronze heading (`Thank You for Your Enquiry | SOFISAM`), personalized greeting (`Dear {{Name}}`), acknowledgement text, sign-off (`Team SOFISAM`), and two dark action buttons (`info@sofisam.com ↗` & `www.sofisam.com ↗`).
- **Footer**: Lifted sand ground (`#EEE8DC`), dark SOFISAM logo, headquarters DMCC certification, "Get in Touch" button, direct channels (`info@sofisam.com` & `+971 50 388 5475`), full legal address block, international reach indicators, and copyright.

### 2. Internal Admin Enquiry Notification (`admin-enquiry-email.html` / `admin-enquiry-email-inline.html`)
- **Purpose**: Sent to the internal SOFISAM team / advisory principals when a new mandate enquiry is submitted.
- **Header**: Minimalist lifted sand header (`#EEE8DC`) with the official dark SOFISAM logo.
- **Body**: Clean ivory paper ground (`#F6F2EA`), bronze heading (`New Website Enquiry | SOFISAM`), introductory statement, and a structured **Enquiry Details** card (`#EEE8DC` with a solid `#9E7949` bronze left accent bar).
- **Merge Tags / Fields**:
  - `{{Name}}` — Name & Title
  - `{{Email}}` — Corporate Email
  - `{{Organisation}}` — Company / Organisation
  - `{{AreaOfInterest}}` — Service Discipline / Practice Area
  - `{{Message}}` — Full Mandate Enquiry Message
- **Footer**: Instruction note and automated notification footer.

---

## 🎨 Visual Identity & Design Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Canvas Ground** | `#E8E3DA` | Outer canvas table background |
| **Paper Ground** | `#F6F2EA` | Body background (`--void`) |
| **Lifted Ground** | `#EEE8DC` | Headers, cards, footers (`--char`) |
| **Primary Ink** | `#171717` | Text, primary buttons |
| **Signature Gold** | `#C7A46A` | Eyebrow, rules, indicators (`--gold`) |
| **Warm Bronze** | `#9E7949` | Headings, card accent border, brand text |
| **Deep Bronze** | `#7A5D33` | Headquarters and regional labels |
| **Dividers** | `#DED7CA` | Table and card row dividers |
| **Container Width** | `680px` | Standard corporate email width |

---

## 🚀 How to Preview & Use

- **Browser Preview**: Double-click either `.html` file to preview immediately.
- **Standalone Distribution**: Use `-inline.html` files whenever you need zero-dependency emails where images are embedded directly as Base64 URIs.
- **CRM & Backend Integration**: Drop directly into Nodemailer, Resend, SendGrid, HubSpot, or Klaviyo with dynamic template variables.
