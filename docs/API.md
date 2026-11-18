# SOFISAM Backend API Integration Guide

This documentation specifies the complete production backend API for the SOFISAM Institutional and Advisory platform.

- **Production Backend URL:** `https://sofisam-backend.vercel.app`
- **Development Backend URL:** `http://localhost:3000`
- **Public Client Website:** `https://sofisam-seven.vercel.app`
- **MongoDB Database:** `sofisam_admin`

---

## Table of Contents

1. [CORS & Security Architecture](#1-cors--security-architecture)
2. [Public Website Form APIs](#2-public-website-form-apis)
   - [Form 1: Private Office / Institutional Enquiry](#form-1-private-office--institutional-enquiry)
   - [Form 2: General Corporate Contact](#form-2-general-corporate-contact)
   - [Form 3: Newsletter Intelligence Subscription](#form-3-newsletter-intelligence-subscription)
3. [Transactional Email Delivery (Resend)](#3-transactional-email-delivery-resend)
4. [Protected Administrator APIs](#4-protected-administrator-apis)
   - [Executive Overview Stats](#get-apiadmindashboardstats)
   - [Analytics Volume & Trends](#get-apiadmindashboardanalytics)
   - [Recent Submissions](#get-apiadmindashboardrecent)
   - [Enquiries Ledger (CRUD & Filters)](#enquiries-ledger-apis)
   - [Newsletter Intelligence Ledger](#newsletter-management-apis)
5. [Frontend Integration Code Examples](#5-frontend-integration-code-examples)

---

## 1. CORS & Security Architecture

The backend implements strict Cross-Origin Resource Sharing (CORS) with preflight handling.

### Allowed Origins
- `https://sofisam-seven.vercel.app` (Public Website Production)
- `http://localhost:3000` (Local Frontend/Backend Dev)
- Configured via `FRONTEND_URL` environment variable.

### CORS Headers Returned
```http
Access-Control-Allow-Origin: https://sofisam-seven.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

All `OPTIONS` requests receive an immediate `204 No Content` with appropriate headers.

---

## 2. Public Website Form APIs

All public endpoints support:
- Automatic field aliases for maximum compatibility.
- Rate limiting protection (10 submissions per minute per IP for enquiries, 5 per minute for newsletter).
- Silent honeypot spam protection (`_hp` field).
- Non-blocking asynchronous email delivery.

---

### Form 1: Private Office / Institutional Enquiry

- **Primary Route:** `POST /api/public/enquiries/private`
- **Legacy / Short Alias:** `POST /api/enquiries`
- **Access:** Public (No authentication required)
- **Rate Limit:** 10 requests / minute / IP

#### Request Payload
```json
{
  "name": "Lord Alexander Hastings",
  "email": "a.hastings@hastings-family.ch",
  "organisation": "Hastings Multi-Family Office",
  "area": "Strategic Advisory",
  "message": "Inquiring regarding direct private equity co-investment governance.",
  "sourcePage": "https://sofisam-seven.vercel.app/",
  "_hp": ""
}
```

#### Field Specifications

| Field | Type | Required | Description / Aliases |
|---|---|---|---|
| `name` / `nameAndTitle` | `string` | **Yes** (2-120 chars) | Client's full name and institutional title |
| `email` | `string` | **Yes** | Valid corporate or institutional email |
| `organisation` / `company` | `string` | Optional | Company, institution, or family office name |
| `area` / `areaOfInterest` | `string` | Optional | Strategic area of advisory interest |
| `message` | `string` | **Yes** (10-5000 chars) | Confidential enquiry or brief |
| `sourcePage` | `string` | Optional | URL of the originating page |
| `_hp` | `string` | Optional | Honeypot field (must remain empty) |

#### Allowed Values for `area` / `areaOfInterest`
- `"Strategic Advisory"`
- `"Investor Relations"`
- `"Corporate Restructuring"`
- `"GCC / International Expansion"`
- `"Strategic Partnerships"`
- `"Other"`

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Private enquiry submitted successfully. Our partners will be in touch shortly.",
  "data": {
    "referenceId": "ENQ-2026-8491",
    "enquiryReference": "ENQ-2026-8491",
    "name": "Lord Alexander Hastings",
    "email": "a.hastings@hastings-family.ch",
    "formType": "private_enquiry",
    "submittedAt": "2026-11-18T12:00:00.000Z"
  }
}
```

#### Curl Example
```bash
curl -X POST https://sofisam-backend.vercel.app/api/public/enquiries/private \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alexander Sterling",
    "email": "a.sterling@meridiancapital.ch",
    "organisation": "Meridian Capital Partners",
    "area": "Strategic Advisory",
    "message": "Inquiring regarding direct co-investment advisory."
  }'
```

---

### Form 2: General Corporate Contact

- **Primary Route:** `POST /api/public/enquiries/contact`
- **Legacy / Short Alias:** `POST /api/contact`
- **Access:** Public (No authentication required)
- **Rate Limit:** 10 requests / minute / IP

#### Request Payload
```json
{
  "name": "Dr. Elena Rostova",
  "email": "e.rostova@aurorafund.lu",
  "company": "Aurora Global Investments",
  "message": "Requesting information regarding SOFISAM European institutional advisory.",
  "sourcePage": "https://sofisam-seven.vercel.app/contact",
  "_hp": ""
}
```

#### Field Specifications

| Field | Type | Required | Description / Aliases |
|---|---|---|---|
| `name` / `fullName` | `string` | **Yes** (2-120 chars) | Submitter full name |
| `email` | `string` | **Yes** | Contact email address |
| `company` / `organisation` | `string` | Optional | Organization or enterprise name |
| `message` | `string` | **Yes** (10-5000 chars) | General contact enquiry |
| `sourcePage` | `string` | Optional | URL of the originating page |
| `_hp` | `string` | Optional | Honeypot field (must remain empty) |

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Thank you for contacting SOFISAM. Your message has been received.",
  "data": {
    "referenceId": "CNT-2026-2104",
    "enquiryReference": "CNT-2026-2104",
    "name": "Dr. Elena Rostova",
    "email": "e.rostova@aurorafund.lu",
    "formType": "contact",
    "submittedAt": "2026-11-18T12:00:00.000Z"
  }
}
```

#### Curl Example
```bash
curl -X POST https://sofisam-backend.vercel.app/api/public/enquiries/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Elena Rostova",
    "email": "e.rostova@aurorafund.lu",
    "company": "Aurora Global Investments",
    "message": "General institutional advisory consultation inquiry."
  }'
```

---

### Form 3: Newsletter Intelligence Subscription

- **Primary Route:** `POST /api/public/newsletter`
- **Legacy / Short Alias:** `POST /api/newsletter`
- **Access:** Public (No authentication required)
- **Rate Limit:** 5 requests / minute / IP

#### Request Payload
```json
{
  "email": "intelligence.reader@swissbank.ch",
  "consent": true,
  "sourcePage": "https://sofisam-seven.vercel.app/contact"
}
```

#### Response (201 Created or 200 OK)
```json
{
  "success": true,
  "message": "Thank you for subscribing to SOFISAM market intelligence.",
  "data": {
    "email": "intelligence.reader@swissbank.ch",
    "status": "active"
  }
}
```

*Note: If an unsubscribed email re-submits with consent, their status is reactivated to `active` and they receive a welcome confirmation email.*

---

## 3. Transactional Email Delivery (Resend)

Every valid enquiry triggers two simultaneous, non-blocking transactional emails:

1. **Internal Executive Alert (`notifications@sofisam.com` -> Admin)**:
   - Full mandate breakdown.
   - Reference identifier (`ENQ-YYYY-XXXX` or `CNT-YYYY-XXXX`).
   - One-click direct review link to the admin dashboard file (`/enquiries/[id]`).
2. **Branded Customer Acknowledgement (`advisory@sofisam.com` -> Client)**:
   - Styled with SOFISAM's corporate aesthetic (`#14243A` Deep Navy, `#B99A62` Warm Gold, `#FBF8F2` Ivory Cream).
   - Confirms receipt, lists submitted reference code, and sets expectations (response within 1 business day).
3. **Newsletter Welcome Confirmation**:
   - Dispatched upon first-time newsletter signup.

---

## 4. Protected Administrator APIs

Admin endpoints require an active HTTP-only session cookie (`sofisam_admin_session`).

### `GET /api/admin/dashboard/stats`
Returns executive counts and 30-day percentage changes:
```json
{
  "success": true,
  "data": {
    "totalEnquiries": 42,
    "newSubmissions": 7,
    "inProgress": 12,
    "newsletterSubscribers": 185,
    "activeNewsletterSubscribers": 178,
    "changes": {
      "totalEnquiries": 15.5,
      "newSubmissions": 25.0,
      "inProgress": -8.3,
      "newsletterSubscribers": 12.4
    }
  }
}
```

### `GET /api/admin/dashboard/analytics?period=1m`
Query parameters: `period=1m|3m` (default: `1m`).
- `period=1m`: Returns daily volume for the latest 30 rolling days (dates on X-axis).
- `period=3m`: Returns monthly volume for the latest 3 calendar months (month labels on X-axis).
- Both responses return status and channel distributions (`Private Office` vs `Contact`) filtered strictly to the selected period.

### `GET /api/admin/dashboard/recent?limit=5`
Returns latest submissions sorted by `submittedAt: -1`.

### Enquiries Ledger APIs

#### List & Filter Enquiries
`GET /api/admin/enquiries`
- `search`: string (matches reference ID, name, email, company, area)
- `formType`: `all` | `private_enquiry` | `contact`
- `status`: `all` | `new` | `contacted` | `in_progress` | `converted` | `closed`
- `priority`: `all` | `low` | `normal` | `high`
- `dateRange`: `all` | `7d` | `30d` | `90d`
- `sortBy`: `newest` | `oldest`
- `page`: number (default 1)
- `limit`: number (default 10)

#### Get Single Enquiry
`GET /api/admin/enquiries/:id`
Finds by MongoDB `_id` or `enquiryReference` (`ENQ-YYYY-XXXX` or `CNT-YYYY-XXXX`).

#### Update Enquiry Status / Priority / Add Note
`PATCH /api/admin/enquiries/:id`
```json
{
  "status": "contacted",
  "priority": "high",
  "note": "Initial consultation scheduled for Monday with Senior Partner."
}
```

#### Delete Enquiry
`DELETE /api/admin/enquiries/:id`

---

### Newsletter Management APIs

#### List Subscribers
`GET /api/admin/newsletter`
- `search`: string (email substring)
- `status`: `all` | `active` | `unsubscribed`
- `page`: number
- `limit`: number

#### Toggle Status
`PATCH /api/admin/newsletter/:id`
```json
{
  "status": "unsubscribed"
}
```

#### Delete Subscriber
`DELETE /api/admin/newsletter/:id`

---

## 5. Frontend Integration Code Examples

The public website developer can drop in these functions directly.

### Private Enquiry Submission Helper
```typescript
interface PrivateEnquiryData {
  name: string;
  email: string;
  organisation?: string;
  area?: string;
  message: string;
}

export async function submitPrivateEnquiry(data: PrivateEnquiryData) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sofisam-backend.vercel.app';

  const res = await fetch(`${backendUrl}/api/public/enquiries/private`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      sourcePage: window.location.href,
    }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to submit private enquiry.');
  }
  return result;
}
```

### General Contact Form Helper
```typescript
interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export async function submitContactForm(data: ContactFormData) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sofisam-backend.vercel.app';

  const res = await fetch(`${backendUrl}/api/public/enquiries/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      sourcePage: window.location.href,
    }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to submit contact message.');
  }
  return result;
}
```

### Newsletter Signup Helper
```typescript
export async function subscribeNewsletter(email: string) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sofisam-backend.vercel.app';

  const res = await fetch(`${backendUrl}/api/public/newsletter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      consent: true,
      sourcePage: window.location.href,
    }),
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || 'Failed to subscribe to newsletter.');
  }
  return result;
}
```
