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

const privateEnquirySchema = z.object({
  nameAndTitle: z.string().trim().min(2, 'Name & Title is required').optional(),
  name: z.string().trim().min(2, 'Name & Title is required').optional(),
  email: z.string().trim().email('A valid corporate email is required').toLowerCase(),
  organisation: z.string().trim().max(150).optional().nullable(),
  company: z.string().trim().max(150).optional().nullable(),
  areaOfInterest: z.string().trim().optional().nullable(),
  area: z.string().trim().optional().nullable(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  sourcePage: z.string().trim().optional().default('/'),
  // Honeypot field for bot protection
  _hp: z.string().optional(),
});

function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ENQ-${year}-${random}`;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // Rate limiting: max 10 submissions per 15 minutes per IP
    const rateLimit = await checkRateLimit(`public_enq_${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait before submitting another enquiry.' },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Honeypot check: bots that fill hidden fields get silently dropped
    if (body._hp && body._hp.trim().length > 0) {
      console.warn(`[Bot Detected] Honeypot triggered from IP ${clientIp}`);
      return NextResponse.json(
        { success: true, message: 'Enquiry received successfully.' },
        { status: 200, headers: corsHeaders }
      );
    }

    const parsed = privateEnquirySchema.safeParse(body);
    if (!parsed.success) {
      await recordFailedAttempt(`public_enq_${clientIp}`);
      const firstErr = parsed.error.issues[0]?.message || 'Invalid enquiry submission.';
      return NextResponse.json({ error: firstErr }, { status: 400, headers: corsHeaders });
    }

    const data = parsed.data;
    const clientName = data.nameAndTitle || data.name;
    if (!clientName) {
      return NextResponse.json(
        { error: 'Name and Title is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const org = data.organisation || data.company || '';
    const interest = data.areaOfInterest || data.area || 'Strategic Advisory';

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

    // 1. Save to MongoDB FIRST (guarantee persistence)
    const newEnquiry = new Enquiry({
      enquiryReference: reference,
      formType: 'private_enquiry',
      nameAndTitle: clientName,
      fullName: clientName,
      email: data.email,
      organisation: org,
      company: org,
      areaOfInterest: interest,
      message: data.message,
      status: 'new',
      priority: 'high', // Private office mandates default to high priority
      sourcePage: data.sourcePage || 'https://sofisam-seven.vercel.app/',
      adminNotes: [],
      emailStatus: {
        adminNotification: 'pending',
        customerAcknowledgement: 'pending',
      },
      submittedAt: submittedDate,
    });

    await newEnquiry.save();

    // 2. Dispatch notifications asynchronously without blocking response
    sendEnquiryEmails({
      referenceId: reference,
      formType: 'private_enquiry',
      name: clientName,
      email: data.email,
      organisation: org,
      areaOfInterest: interest,
      message: data.message,
      submittedAt: submittedDate,
      sourcePage: data.sourcePage || 'https://sofisam-seven.vercel.app/',
    })
      .then(async (emailRes) => {
        await Enquiry.updateOne(
          { enquiryReference: reference },
          { $set: { emailStatus: emailRes } }
        );
      })
      .catch((err) => {
        console.error(`[Email Dispatch Error] For reference ${reference}:`, err);
      });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you. Your enquiry has been received confidentially.',
        enquiryReference: reference,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Error submitting private enquiry:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again later.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
