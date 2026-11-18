import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      filter.email = searchRegex;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const sortOrder: Record<string, 1 | -1> =
      sortBy === 'oldest' ? { subscribedAt: 1 } : { subscribedAt: -1 };

    const skip = (page - 1) * limit;

    const [totalMatching, subscribers, totalAll, activeCount, unsubscribedCount] =
      await Promise.all([
        NewsletterSubscriber.countDocuments(filter),
        NewsletterSubscriber.find(filter)
          .sort(sortOrder)
          .skip(skip)
          .limit(limit)
          .lean(),
        NewsletterSubscriber.countDocuments(),
        NewsletterSubscriber.countDocuments({ status: 'active' }),
        NewsletterSubscriber.countDocuments({ status: 'unsubscribed' }),
      ]);

    const formatted = subscribers.map((sub) => ({
      _id: sub._id.toString(),
      email: sub.email,
      status: sub.status,
      sourcePage: sub.sourcePage,
      consent: sub.consent,
      subscribedAt: sub.subscribedAt ? new Date(sub.subscribedAt).toISOString() : new Date().toISOString(),
      unsubscribedAt: sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toISOString() : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      metrics: {
        total: totalAll,
        active: activeCount,
        unsubscribed: unsubscribedCount,
      },
      pagination: {
        total: totalMatching,
        page,
        limit,
        totalPages: Math.ceil(totalMatching / limit) || 1,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 });
  }
}
