import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';
import { getCorsHeaders, handleCorsPreflight } from '@/lib/cors';
import { checkRateLimit, recordFailedAttempt } from '@/lib/rateLimit';
import { sendNewsletterConfirmation } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return handleCorsPreflight(origin);
}

const newsletterSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.').toLowerCase(),
  consent: z.boolean().optional().default(true),
  sourcePage: z.string().trim().optional().default('/contact'),
  _hp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    // Rate limiting: max 10 attempts per 15 minutes per IP
    const rateLimit = await checkRateLimit(`public_news_${clientIp}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Honeypot check
    if (body._hp && body._hp.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: 'Thank you for subscribing.' },
        { status: 200, headers: corsHeaders }
      );
    }

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      await recordFailedAttempt(`public_news_${clientIp}`);
      const firstErr = parsed.error.issues[0]?.message || 'Invalid email address.';
      return NextResponse.json({ error: firstErr }, { status: 400, headers: corsHeaders });
    }

    const { email, consent, sourcePage } = parsed.data;

    // Connect to database
    await connectToDatabase();

    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      if (existing.status === 'active') {
        return NextResponse.json(
          {
            success: true,
            message: 'You are already subscribed to SOFISAM Strategic Insights.',
          },
          { status: 200, headers: corsHeaders }
        );
      } else {
        // Resubscribe with fresh consent
        existing.status = 'active';
        existing.consent = consent;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await existing.save();

        sendNewsletterConfirmation(email).catch(console.error);

        return NextResponse.json(
          {
            success: true,
            message: 'Your subscription to SOFISAM Strategic Insights has been reactivated.',
          },
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // Create new subscriber
    const newSubscriber = new NewsletterSubscriber({
      email,
      status: 'active',
      consent,
      sourcePage: sourcePage || 'https://sofisam-seven.vercel.app/contact',
      subscribedAt: new Date(),
    });

    await newSubscriber.save();

    // Send confirmation email
    sendNewsletterConfirmation(email).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing to SOFISAM Strategic Insights.',
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error('Error in newsletter subscription:', error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again later.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
