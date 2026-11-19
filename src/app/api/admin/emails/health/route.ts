import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import EmailWebhookEvent from '@/models/EmailWebhookEvent';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const resendApiKey = process.env.RESEND_API_KEY;
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    const senderEmail = process.env.RESEND_FROM_EMAIL || 'SOFISAM <onboarding@resend.dev>';

    const resendConfigured = Boolean(resendApiKey && !resendApiKey.includes('REPLACE_WITH'));
    const webhookSecretConfigured = Boolean(
      webhookSecret && !webhookSecret.includes('REPLACE_WITH')
    );

    const now = new Date();
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      totalCount,
      deliveredCount,
      failedCount,
      latestAttempt,
      latestSent,
      latestDelivered,
      latestFailed,
      latestWebhookEvent,
      latestSuccessfulWebhook,
      latestFailedWebhook,
      totalWebhookEvents,
      totalWebhookProcessed,
      totalWebhookFailures,
      recentFailureCount24h,
    ] = await Promise.all([
      EmailLog.countDocuments(),
      EmailLog.countDocuments({
        $or: [
          { status: 'delivered' },
          { openedAt: { $exists: true, $ne: null } },
          { clickedAt: { $exists: true, $ne: null } },
        ],
      }),
      EmailLog.countDocuments({ status: { $in: ['failed', 'bounced', 'complained'] } }),
      EmailLog.findOne().sort({ createdAt: -1 }).select('createdAt').lean(),
      EmailLog.findOne({ status: { $in: ['sent', 'delivered'] } })
        .sort({ sentAt: -1 })
        .select('sentAt')
        .lean(),
      EmailLog.findOne({
        $or: [
          { status: 'delivered' },
          { openedAt: { $exists: true, $ne: null } },
        ],
      })
        .sort({ deliveredAt: -1, openedAt: -1 })
        .select('deliveredAt openedAt')
        .lean(),
      EmailLog.findOne({ status: { $in: ['failed', 'bounced'] } })
        .sort({ failedAt: -1, bouncedAt: -1 })
        .select('failedAt bouncedAt errorMessage')
        .lean(),
      EmailWebhookEvent.findOne()
        .sort({ processedAt: -1 })
        .select('processedAt eventType processingStatus eventId')
        .lean(),
      EmailWebhookEvent.findOne({ processingStatus: 'success' })
        .sort({ processedAt: -1 })
        .select('processedAt eventType resendEmailId')
        .lean(),
      EmailWebhookEvent.findOne({ processingStatus: { $in: ['failed', 'unmatched'] } })
        .sort({ processedAt: -1 })
        .select('processedAt eventType errorMessage')
        .lean(),
      EmailWebhookEvent.countDocuments(),
      EmailWebhookEvent.countDocuments({ processingStatus: 'success' }),
      EmailWebhookEvent.countDocuments({ processingStatus: { $in: ['failed', 'unmatched'] } }),
      EmailLog.countDocuments({
        createdAt: { $gte: past24h },
        status: { $in: ['failed', 'bounced'] },
      }),
    ]);

    const overallDeliveryRate =
      totalCount > 0 ? Math.round((deliveredCount / totalCount) * 1000) / 10 : 100;
    const overallFailureRate =
      totalCount > 0 ? Math.round((failedCount / totalCount) * 1000) / 10 : 0;

    let webhookStatus: 'active' | 'not_configured' | 'error' = 'not_configured';
    if (!webhookSecretConfigured) {
      webhookStatus = 'not_configured';
    } else if (latestWebhookEvent && latestWebhookEvent.processingStatus === 'failed') {
      webhookStatus = 'error';
    } else {
      webhookStatus = 'active';
    }

    const lastDeliveredAt = latestDelivered?.deliveredAt
      ? new Date(latestDelivered.deliveredAt).toISOString()
      : latestDelivered?.openedAt
      ? new Date(latestDelivered.openedAt).toISOString()
      : undefined;
    const lastFailedAt = latestFailed
      ? new Date(latestFailed.failedAt || latestFailed.bouncedAt || new Date()).toISOString()
      : undefined;
    const lastFailedReason = latestFailed?.errorMessage || undefined;

    return NextResponse.json({
      success: true,
      data: {
        resendConfigured,
        webhookConfigured: webhookSecretConfigured,
        webhookStatus,
        senderDomain: senderEmail,
        webhookUrl: 'https://sofisam-backend.vercel.app/api/webhooks/resend',
        subscribedEvents: [
          'email.sent',
          'email.delivered',
          'email.delivery_delayed',
          'email.bounced',
          'email.failed',
          'email.complained',
          'email.opened',
          'email.clicked',
        ],
        totalWebhookEvents,
        totalWebhookEventsReceived: totalWebhookEvents,
        totalWebhookEventsProcessed: totalWebhookProcessed,
        totalWebhookProcessingFailures: totalWebhookFailures,
        lastWebhookReceivedAt: latestWebhookEvent?.processedAt
          ? new Date(latestWebhookEvent.processedAt).toISOString()
          : undefined,
        lastProcessedAt: latestSuccessfulWebhook?.processedAt
          ? new Date(latestSuccessfulWebhook.processedAt).toISOString()
          : undefined,
        lastProcessingError: latestFailedWebhook?.errorMessage
          ? `${latestFailedWebhook.eventType}: ${latestFailedWebhook.errorMessage}`
          : undefined,
        latestSuccessfulDispatch: latestSent?.sentAt
          ? new Date(latestSent.sentAt).toISOString()
          : undefined,
        lastSuccessfulApiResponse: latestSent?.sentAt
          ? new Date(latestSent.sentAt).toISOString()
          : undefined,
        lastEmailAttempt: latestAttempt?.createdAt
          ? new Date(latestAttempt.createdAt).toISOString()
          : undefined,
        latestSuccessfulDelivery: lastDeliveredAt,
        lastConfirmedDelivery: lastDeliveredAt,
        lastDeliveredAt,
        latestEmailFailure: latestFailed
          ? {
              timestamp: lastFailedAt!,
              message: lastFailedReason || 'Unknown delivery failure',
            }
          : undefined,
        lastFailedAt,
        lastFailedReason,
        overallDeliveryRate,
        overallFailureRate,
        recentFailureCount24h,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching email health:', error);
    return NextResponse.json({ error: 'Failed to retrieve email health' }, { status: 500 });
  }
}
