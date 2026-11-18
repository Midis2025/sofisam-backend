import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';
import { checkRateLimit, recordFailedAttempt } from '@/lib/rateLimit';
import { sendEnquiryEmails } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return handleCorsPreflight(origin);
}

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.').optional(),
  name: z.string().trim().min(2, 'Please enter your full name.').optional(),
  email: z.string().trim().email('Please enter a valid email address.').toLowerCase(),
  company: z.string().trim().max(150).optional().nullable(),
  organisation: z.string().trim().max(150).optional().nullable(),
  message: z.string().trim().min(12, 'Please add a little more detail (minimum 12 characters).').max(5000),
  sourcePage: z.string().trim().optional().default('/contact'),
  _hp: z.string().optional(),
});

function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CNT-${year}-${random}`;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // Rate limiting: max 10 submissions per 15 minutes per IP
    const rateLimit = await checkRateLimit(`public_cnt_${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait before sending another message.' },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Honeypot check
    if (body._hp && body._hp.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: 'Message sent successfully.' },
        { status: 200, headers: corsHeaders }
      );
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      await recordFailedAttempt(`public_cnt_${clientIp}`);
      const firstErr = parsed.error.issues[0]?.message || 'Invalid form input.';
      return NextResponse.json({ error: firstErr }, { status: 400, headers: corsHeaders });
    }

    const data = parsed.data;
    const clientName = data.fullName || data.name;
    if (!clientName) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const org = data.company || data.organisation || '';

    // Connect to database
    await connectToDatabase();

    // Generate unique reference
    let reference = generateReference();
    let collisionCheck = await Enquiry.findOne({ enquiryReference: reference }).lean();
    while (collisionCheck) {
      reference = generateReference();
      collisionCheck = await Enquiry.findOne({ enquiryReference: reference }).lean();
    }

    const submittedDate = new Date();

    // 1. Save to MongoDB FIRST
    const newContact = new Enquiry({
      enquiryReference: reference,
      formType: 'contact',
      fullName: clientName,
      nameAndTitle: clientName,
      email: data.email,
      company: org,
      organisation: org,
      areaOfInterest: 'General Corporate Contact',
      message: data.message,
      status: 'new',
      priority: 'normal',
      sourcePage: data.sourcePage || 'https://sofisam-seven.vercel.app/contact',
      adminNotes: [],
      emailStatus: {
        adminNotification: 'pending',
        customerAcknowledgement: 'pending',
      },
      submittedAt: submittedDate,
    });

    await newContact.save();

    // 2. Dispatch notifications asynchronously
    sendEnquiryEmails({
      referenceId: reference,
      formType: 'contact',
      name: clientName,
      email: data.email,
      organisation: org,
      areaOfInterest: 'General Corporate Contact',
      message: data.message,
      submittedAt: submittedDate,
      sourcePage: data.sourcePage || 'https://sofisam-seven.vercel.app/contact',
    })
      .then(async (emailRes) => {
        await Enquiry.updateOne(
          { enquiryReference: reference },
          { $set: { emailStatus: emailRes } }
        );
      })
      .catch((err) => {
        console.error(`[Email Dispatch Error] For contact ref ${reference}:`, err);
      });

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent. A SOFISAM representative will respond promptly.',
        enquiryReference: reference,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again later.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
