import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import connectToDatabase from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';
import EmailWebhookEvent from '@/models/EmailWebhookEvent';
import Enquiry from '@/models/Enquiry';
import { EmailDeliveryStatusType } from '@/types';

export const dynamic = 'force-dynamic';

const STATUS_PRIORITY: Record<EmailDeliveryStatusType, number> = {
  queued: 0,
  sent: 1,
  delivery_delayed: 2,
  delivered: 3,
  bounced: 4,
  complained: 4,
  failed: 4,
};

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from?: string;
    to?: string[];
    subject?: string;
    created_at?: string;
    bounce?: {
      message?: string;
      type?: string;
    };
    click?: {
      link?: string;
    };
    error?: {
      message?: string;
      code?: string;
    };
    [key: string]: unknown;
  };
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('[Resend Webhook] RESEND_WEBHOOK_SECRET is not configured.');
    return NextResponse.json(
      { error: 'Webhook secret is not configured on this server.' },
      { status: 500 }
    );
  }

  // 1. Read raw body and Svix signature headers
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error('[Resend Webhook] Failed to read raw body:', err);
    return NextResponse.json({ error: 'Failed to read request body.' }, { status: 400 });
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.warn('[Resend Webhook] Missing required Svix headers.');
    return NextResponse.json(
      { error: 'Missing required Svix webhook verification headers.' },
      { status: 400 }
    );
  }

  // 2. Cryptographic signature verification
  let eventPayload: ResendWebhookPayload;
  try {
    const wh = new Webhook(webhookSecret);
    wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
    eventPayload = JSON.parse(rawBody) as ResendWebhookPayload;
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Signature mismatch';
    console.error('[Resend Webhook] Cryptographic verification failed:', msg);
    return NextResponse.json({ error: `Invalid signature: ${msg}` }, { status: 401 });
  }

  const { type: eventType, created_at: eventTimeStr, data } = eventPayload;
  const resendEmailId = data?.email_id;
  const eventDate = eventTimeStr ? new Date(eventTimeStr) : new Date();

  // 3. Connect to MongoDB
  try {
    await connectToDatabase();
  } catch (dbErr) {
    console.error('[Resend Webhook] Database connection error:', dbErr);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  // 4. Idempotency Check: Prevent duplicate webhook processing
  const existingEvent = await EmailWebhookEvent.findOne({ eventId: svixId }).lean();
  if (existingEvent) {
    return NextResponse.json(
      { success: true, message: 'Event already processed (idempotent duplicate).' },
      { status: 200 }
    );
  }

  // Record webhook receipt in EmailWebhookEvent
  const webhookRecord = new EmailWebhookEvent({
    eventId: svixId,
    eventType,
    resendEmailId,
    payload: eventPayload as unknown as Record<string, unknown>,
    processedAt: new Date(),
    processingStatus: 'success',
  });

  if (!resendEmailId) {
    webhookRecord.processingStatus = 'unmatched';
    webhookRecord.errorMessage = 'Event missing data.email_id';
    await webhookRecord.save();
    return NextResponse.json({ success: true, message: 'Logged unaddressed event' });
  }

  // 5. Match EmailLog by resendEmailId
  const emailLog = await EmailLog.findOne({ resendEmailId });

  if (!emailLog) {
    webhookRecord.processingStatus = 'unmatched';
    webhookRecord.errorMessage = `No EmailLog found with resendEmailId: ${resendEmailId}`;
    await webhookRecord.save();
    return NextResponse.json(
      { success: true, message: 'Event stored, no matching local email log found.' },
      { status: 200 }
    );
  }

  // 6. Map Webhook Event to Status and Timeline Event
  let targetStatus: EmailDeliveryStatusType | null = null;
  let timelineDetail = '';

  switch (eventType) {
    case 'email.sent':
      targetStatus = 'sent';
      timelineDetail = 'Accepted and dispatched by Resend mail server';
      if (!emailLog.sentAt) emailLog.sentAt = eventDate;
      break;

    case 'email.delivered':
      targetStatus = 'delivered';
      timelineDetail = 'Delivered to recipient mail exchanger';
      emailLog.deliveredAt = eventDate;
      break;

    case 'email.delivery_delayed':
      targetStatus = 'delivery_delayed';
      timelineDetail = 'Delivery temporarily delayed by recipient mail server';
      break;

    case 'email.bounced':
      targetStatus = 'bounced';
      emailLog.bouncedAt = eventDate;
      emailLog.errorMessage =
        data.bounce?.message || 'Message bounced by receiving mail server';
      timelineDetail = `Bounced (${data.bounce?.type || 'Hard'}): ${emailLog.errorMessage}`;
      break;

    case 'email.complained':
      targetStatus = 'complained';
      timelineDetail = 'Recipient filed a spam complaint';
      break;

    case 'email.failed':
      targetStatus = 'failed';
      emailLog.failedAt = eventDate;
      emailLog.errorMessage = data.error?.message || 'Transmission failed';
      timelineDetail = `Failed: ${emailLog.errorMessage}`;
      break;

    case 'email.opened':
      targetStatus = 'delivered';
      timelineDetail = 'Recipient opened email';
      if (!emailLog.deliveredAt) emailLog.deliveredAt = eventDate;
      if (!emailLog.openedAt) emailLog.openedAt = eventDate;
      emailLog.lastOpenedAt = eventDate;
      emailLog.openedCount = (emailLog.openedCount || 0) + 1;
      break;

    case 'email.clicked':
      targetStatus = 'delivered';
      timelineDetail = `Recipient clicked link in email${data?.click?.link ? `: ${data.click.link}` : ''}`;
      if (!emailLog.deliveredAt) emailLog.deliveredAt = eventDate;
      if (!emailLog.clickedAt) emailLog.clickedAt = eventDate;
      emailLog.clickedCount = (emailLog.clickedCount || 0) + 1;
      break;

    default:
      timelineDetail = `Received Resend event: ${eventType}`;
      break;
  }

  // 7. Safe out-of-order state transition
  if (targetStatus) {
    const currentWeight = STATUS_PRIORITY[emailLog.status] ?? 0;
    const targetWeight = STATUS_PRIORITY[targetStatus] ?? 0;

    // Rule 1: Delayed or sent event must NEVER overwrite an already delivered/opened status
    if (
      (targetStatus === 'delivery_delayed' || targetStatus === 'sent') &&
      (emailLog.status === 'delivered' || emailLog.openedAt || emailLog.clickedAt)
    ) {
      // Do not downgrade confirmed delivery
    } else if (
      (emailLog.status === 'bounced' || emailLog.status === 'failed') &&
      targetStatus === 'delivered'
    ) {
      // If already marked terminal bounced/failed, retain bounced/failed but record the open event
    } else if (targetWeight >= currentWeight) {
      emailLog.status = targetStatus;
    }
  }

  emailLog.lastEventAt = eventDate;
  emailLog.events.push({
    eventType,
    timestamp: eventDate,
    details: timelineDetail,
  });
  emailLog.eventHistory.push({
    eventType,
    timestamp: eventDate,
    details: timelineDetail,
    data: data as Record<string, unknown>,
  });

  await emailLog.save();
  await webhookRecord.save();

  // 8. If linked to an Enquiry, synchronize its email delivery status
  if (emailLog.relatedEnquiryReference) {
    try {
      const updateField =
        emailLog.emailType === 'admin_notification'
          ? 'emailStatus.adminNotification'
          : 'emailStatus.customerAcknowledgement';

      const statusForEnquiry =
        emailLog.status === 'delivered' || emailLog.status === 'sent'
          ? 'sent'
          : emailLog.status === 'failed' || emailLog.status === 'bounced'
          ? 'failed'
          : 'pending';

      await Enquiry.updateOne(
        { enquiryReference: emailLog.relatedEnquiryReference },
        { $set: { [updateField]: statusForEnquiry } }
      );
    } catch (enqSyncErr) {
      console.error('[Resend Webhook] Failed to sync status with Enquiry record:', enqSyncErr);
    }
  }

  return NextResponse.json({
    success: true,
    message: `Processed ${eventType} for ${resendEmailId}`,
    currentStatus: emailLog.status,
  });
}
