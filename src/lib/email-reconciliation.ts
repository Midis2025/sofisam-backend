import { Resend } from 'resend';
import EmailLog from '@/models/EmailLog';
import connectToDatabase from '@/lib/mongodb';

export interface ReconcileResult {
  totalChecked: number;
  updatedCount: number;
  errors: string[];
  records: Array<{
    resendEmailId: string;
    previousStatus: string;
    newStatus: string;
    lastEvent: string;
  }>;
}

/**
 * Reconciles EmailLog records against the authoritative live Resend API.
 * This is safe, idempotent, and non-destructive.
 */
export async function reconcileEmailsWithResend(targetId?: string): Promise<ReconcileResult> {
  await connectToDatabase();

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes('REPLACE_WITH')) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const resend = new Resend(apiKey);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    resendEmailId: { $exists: true, $ne: null, $nin: ['', 'pending'] },
  };

  if (targetId) {
    query._id = targetId;
  }

  const emailLogs = await EmailLog.find(query);

  let updatedCount = 0;
  const errors: string[] = [];
  const records: ReconcileResult['records'] = [];

  for (const log of emailLogs) {
    try {
      const resendRes = await resend.emails.get(log.resendEmailId!);
      const resendData = resendRes.data;

      if (!resendData) {
        continue;
      }

      const lastEvent = resendData.last_event || 'unknown';
      const prevStatus = log.status;
      let hasChanges = false;
      const eventTime = resendData.created_at ? new Date(resendData.created_at) : log.createdAt;

      if (lastEvent === 'opened') {
        if (log.status !== 'delivered') {
          log.status = 'delivered';
          hasChanges = true;
        }
        if (!log.deliveredAt) {
          log.deliveredAt = eventTime;
          hasChanges = true;
        }
        if (!log.openedAt) {
          log.openedAt = eventTime;
          hasChanges = true;
        }
        if (!log.lastOpenedAt) {
          log.lastOpenedAt = eventTime;
          hasChanges = true;
        }
        if (!log.openedCount || log.openedCount < 1) {
          log.openedCount = 1;
          hasChanges = true;
        }

        // Add timeline events if not recorded
        const hasOpenEvent = (log.events || []).some((e) => e.eventType === 'email.opened');
        if (!hasOpenEvent) {
          log.events.push({
            eventType: 'email.opened',
            timestamp: eventTime,
            details: 'Recipient opened email (synchronized from Resend tracking)',
          });
          log.eventHistory.push({
            eventType: 'email.opened',
            timestamp: eventTime,
            details: 'Recipient opened email (synchronized from Resend tracking)',
            data: { source: 'resend_sync', last_event: lastEvent },
          });
          hasChanges = true;
        }
      } else if (lastEvent === 'clicked') {
        if (log.status !== 'delivered') {
          log.status = 'delivered';
          hasChanges = true;
        }
        if (!log.deliveredAt) {
          log.deliveredAt = eventTime;
          hasChanges = true;
        }
        if (!log.clickedAt) {
          log.clickedAt = eventTime;
          hasChanges = true;
        }
        if (!log.clickedCount || log.clickedCount < 1) {
          log.clickedCount = 1;
          hasChanges = true;
        }
      } else if (lastEvent === 'delivered') {
        if (log.status !== 'delivered') {
          log.status = 'delivered';
          hasChanges = true;
        }
        if (!log.deliveredAt) {
          log.deliveredAt = eventTime;
          hasChanges = true;
        }
      } else if (lastEvent === 'bounced') {
        if (log.status !== 'bounced') {
          log.status = 'bounced';
          hasChanges = true;
        }
        if (!log.bouncedAt) {
          log.bouncedAt = eventTime;
          hasChanges = true;
        }
      }

      if (hasChanges) {
        log.lastEventAt = new Date();
        await log.save();
        updatedCount++;
      }

      records.push({
        resendEmailId: log.resendEmailId!,
        previousStatus: prevStatus,
        newStatus: log.status,
        lastEvent,
      });
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Unknown error during sync';
      errors.push(`Failed to reconcile ${log.resendEmailId}: ${msg}`);
    }
  }

  return {
    totalChecked: emailLogs.length,
    updatedCount,
    errors,
    records,
  };
}

