import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Parallel aggregate count queries
    const [
      totalEnquiries,
      newSubmissions,
      inProgress,
      newsletterSubscribers,
      activeNewsletterSubscribers,
      currPeriodEnquiries,
      prevPeriodEnquiries,
      currPeriodNew,
      prevPeriodNew,
      currPeriodInProgress,
      prevPeriodInProgress,
      currPeriodSubs,
      prevPeriodSubs,
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Enquiry.countDocuments({ status: 'in_progress' }),
      NewsletterSubscriber.countDocuments(),
      NewsletterSubscriber.countDocuments({ status: 'active' }),
      Enquiry.countDocuments({ submittedAt: { $gte: thirtyDaysAgo } }),
      Enquiry.countDocuments({ submittedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Enquiry.countDocuments({ status: 'new', submittedAt: { $gte: thirtyDaysAgo } }),
      Enquiry.countDocuments({ status: 'new', submittedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Enquiry.countDocuments({ status: 'in_progress', submittedAt: { $gte: thirtyDaysAgo } }),
      Enquiry.countDocuments({ status: 'in_progress', submittedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      NewsletterSubscriber.countDocuments({ subscribedAt: { $gte: thirtyDaysAgo } }),
      NewsletterSubscriber.countDocuments({ subscribedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    ]);

    const calculateChange = (current: number, previous: number): number | null => {
      if (previous === 0) {
        return current > 0 ? 100 : null;
      }
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return NextResponse.json({
      success: true,
      data: {
        totalEnquiries,
        newSubmissions,
        inProgress,
        newsletterSubscribers,
        activeNewsletterSubscribers,
        previousPeriod: {
          totalEnquiries: prevPeriodEnquiries,
          newSubmissions: prevPeriodNew,
          inProgress: prevPeriodInProgress,
          newsletterSubscribers: prevPeriodSubs,
        },
        changes: {
          totalEnquiries: calculateChange(currPeriodEnquiries, prevPeriodEnquiries),
          newSubmissions: calculateChange(currPeriodNew, prevPeriodNew),
          inProgress: calculateChange(currPeriodInProgress, prevPeriodInProgress),
          newsletterSubscribers: calculateChange(currPeriodSubs, prevPeriodSubs),
        },
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to load statistics' }, { status: 500 });
  }
}
