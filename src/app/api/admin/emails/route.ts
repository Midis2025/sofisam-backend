import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const status = searchParams.get('status');
    const emailType = searchParams.get('type') || searchParams.get('emailType');
    const dateRange = searchParams.get('dateRange');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // 1. Text search
    if (search) {
      const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      filter.$or = [
        { recipient: searchRegex },
        { subject: searchRegex },
        { relatedEnquiryReference: searchRegex },
        { resendEmailId: searchRegex },
      ];
    }

    // 2. Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // 3. Email Type filter
    if (emailType && emailType !== 'all') {
      if (emailType === 'newsletter_welcome' || emailType === 'newsletter_confirmation') {
        filter.emailType = { $in: ['newsletter_welcome', 'newsletter_confirmation'] };
      } else {
        filter.emailType = emailType;
      }
    }

    // 4. Date Range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let ms = 0;
      if (dateRange === '24h') ms = 24 * 60 * 60 * 1000;
      else if (dateRange === '7d') ms = 7 * 24 * 60 * 60 * 1000;
      else if (dateRange === '30d') ms = 30 * 24 * 60 * 60 * 1000;
      else if (dateRange === '90d') ms = 90 * 24 * 60 * 60 * 1000;

      if (ms > 0) {
        filter.createdAt = { $gte: new Date(now.getTime() - ms) };
      }
    }

    const sortOrder: Record<string, 1 | -1> =
      sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [total, emailDocs] = await Promise.all([
      EmailLog.countDocuments(filter),
      EmailLog.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const formatted = emailDocs.map((doc) => ({
      _id: doc._id.toString(),
      resendEmailId: doc.resendEmailId || '',
      recipient: doc.recipient,
      sender: doc.sender,
      subject: doc.subject,
      emailType: doc.emailType,
      provider: doc.provider || 'resend',
      status: doc.status,
      relatedEnquiryReference: doc.relatedEnquiryReference || '',
      relatedEnquiryId: doc.relatedEnquiryId ? doc.relatedEnquiryId.toString() : undefined,
      errorMessage: doc.errorMessage || '',
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      sentAt: doc.sentAt ? new Date(doc.sentAt).toISOString() : undefined,
      deliveredAt: doc.deliveredAt ? new Date(doc.deliveredAt).toISOString() : undefined,
      failedAt: doc.failedAt ? new Date(doc.failedAt).toISOString() : undefined,
      bouncedAt: doc.bouncedAt ? new Date(doc.bouncedAt).toISOString() : undefined,
      openedAt: doc.openedAt ? new Date(doc.openedAt).toISOString() : undefined,
      lastOpenedAt: doc.lastOpenedAt ? new Date(doc.lastOpenedAt).toISOString() : undefined,
      clickedAt: doc.clickedAt ? new Date(doc.clickedAt).toISOString() : undefined,
      openedCount: doc.openedCount || 0,
      clickedCount: doc.clickedCount || 0,
      lastEventAt: doc.lastEventAt ? new Date(doc.lastEventAt).toISOString() : undefined,
      events: (doc.events || []).map((e) => ({
        eventType: e.eventType,
        name: e.eventType,
        timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : new Date().toISOString(),
        details: e.details || '',
        description: e.details || '',
      })),
      eventHistory: (doc.eventHistory || doc.events || []).map((e) => ({
        eventType: e.eventType,
        name: e.eventType,
        timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : new Date().toISOString(),
        details: e.details || '',
        description: e.details || '',
        metadata: e.data as Record<string, unknown> | undefined,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching email activity logs:', error);
    return NextResponse.json({ error: 'Failed to load email activity' }, { status: 500 });
  }
}
