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
    const period = searchParams.get('period') || '30d';

    let dateThreshold: Date | null = null;
    const now = new Date();

    if (period === '24h') {
      dateThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (period === '7d') {
      dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '90d') {
      dateThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } // 'all' leaves dateThreshold null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (dateThreshold) {
      filter.createdAt = { $gte: dateThreshold };
    }

    const [
      totalEmails,
      delivered,
      sentOnly,
      queuedOnly,
      deliveryDelayed,
      failed,
      bounced,
      complained,
      uniqueOpened,
      uniqueClicked,
      engagementAggregation,
      typeAggregation,
      dailyAggregation,
    ] = await Promise.all([
      // Total emails created in period
      EmailLog.countDocuments(filter),

      // Confirmed delivered: either status='delivered' or recorded open/click
      EmailLog.countDocuments({
        ...filter,
        $or: [
          { status: 'delivered' },
          { openedAt: { $exists: true, $ne: null } },
          { clickedAt: { $exists: true, $ne: null } },
        ],
      }),

      // Sent but pending delivery confirmation (excluding opened/clicked)
      EmailLog.countDocuments({
        ...filter,
        status: 'sent',
        openedAt: null,
        clickedAt: null,
      }),

      // Queued
      EmailLog.countDocuments({ ...filter, status: 'queued' }),

      // Temporarily delayed by recipient server (excluding delivered)
      EmailLog.countDocuments({
        ...filter,
        status: 'delivery_delayed',
        openedAt: null,
        clickedAt: null,
      }),

      // Failed (transmission error / API error)
      EmailLog.countDocuments({ ...filter, status: 'failed' }),

      // Bounced (hard/soft bounce from recipient exchanger)
      EmailLog.countDocuments({ ...filter, status: 'bounced' }),

      // Spam complaint
      EmailLog.countDocuments({ ...filter, status: 'complained' }),

      // Unique emails opened
      EmailLog.countDocuments({
        ...filter,
        $or: [{ openedCount: { $gt: 0 } }, { openedAt: { $exists: true, $ne: null } }],
      }),

      // Unique emails clicked
      EmailLog.countDocuments({
        ...filter,
        $or: [{ clickedCount: { $gt: 0 } }, { clickedAt: { $exists: true, $ne: null } }],
      }),

      // Total open/click events sum
      EmailLog.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOpens: { $sum: { $ifNull: ['$openedCount', 0] } },
            totalClicks: { $sum: { $ifNull: ['$clickedCount', 0] } },
          },
        },
      ]),

      // Type breakdown
      EmailLog.aggregate([
        { $match: filter },
        { $group: { _id: '$emailType', count: { $sum: 1 } } },
      ]),

      // Daily aggregation
      EmailLog.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: 1 },
            delivered: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$status', 'delivered'] },
                      { $gt: ['$openedCount', 0] },
                      { $gt: ['$clickedCount', 0] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            failed: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['failed', 'bounced', 'complained']] },
                  1,
                  0,
                ],
              },
            },
            opened: {
              $sum: {
                $cond: [{ $gt: ['$openedCount', 0] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Breakdown by type
    const breakdownByType: Record<string, number> = {
      admin_notification: 0,
      customer_acknowledgement: 0,
      newsletter_welcome: 0,
    };
    typeAggregation.forEach((t: { _id: string; count: number }) => {
      if (t._id) breakdownByType[t._id] = t.count;
    });

    // Daily volume
    const dailyEmailVolume = dailyAggregation.map(
      (d: { _id: string; total: number; delivered: number; failed: number; opened?: number }) => ({
        date: d._id,
        total: d.total,
        delivered: d.delivered,
        failed: d.failed,
        opened: d.opened || 0,
      })
    );

    // In Transit: genuinely pending or delayed
    const inTransit = sentOnly + deliveryDelayed + queuedOnly;
    const totalFailedOrBounced = failed + bounced + complained;
    const totalAccepted = totalEmails - queuedOnly;

    const totalOpens = engagementAggregation[0]?.totalOpens || uniqueOpened;
    const totalClicks = engagementAggregation[0]?.totalClicks || uniqueClicked;

    // Delivery rate (delivered / accepted dispatches)
    const deliveryRate =
      totalAccepted > 0 ? Number(((delivered / totalAccepted) * 100).toFixed(1)) : 0;

    // Failure rate (bounced + failed / total dispatches)
    const failureRate =
      totalEmails > 0 ? Number(((totalFailedOrBounced / totalEmails) * 100).toFixed(1)) : 0;

    // Open rate (unique opened / delivered)
    const openRate =
      delivered > 0
        ? Number(((uniqueOpened / delivered) * 100).toFixed(1))
        : totalAccepted > 0
        ? Number(((uniqueOpened / totalAccepted) * 100).toFixed(1))
        : 0;

    // Click rate (unique clicked / delivered)
    const clickRate =
      delivered > 0
        ? Number(((uniqueClicked / delivered) * 100).toFixed(1))
        : totalAccepted > 0
        ? Number(((uniqueClicked / totalAccepted) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalEmails,
        totalSent: totalEmails,
        totalAccepted,
        sent: sentOnly,
        delivered,
        pending: inTransit,
        inTransit,
        failed,
        bounced,
        complained,
        deliveryDelayed,
        deliveryRate,
        failureRate,
        opened: uniqueOpened,
        uniqueOpened,
        totalOpens,
        openRate,
        clicked: uniqueClicked,
        uniqueClicked,
        totalClicks,
        clickRate,
        breakdownByType,
        emailBreakdownByType: breakdownByType,
        dailyEmailVolume,
        dailyVolume: dailyEmailVolume,
      },
      period,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching email stats:', error);
    return NextResponse.json({ error: 'Failed to load email statistics' }, { status: 500 });
  }
}
