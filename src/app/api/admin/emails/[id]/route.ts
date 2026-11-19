import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import EmailLog from '@/models/EmailLog';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;

    // Filter by ObjectId or by resendEmailId
    const filter = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { resendEmailId: id }] }
      : { resendEmailId: id };

    const doc = await EmailLog.findOne(filter).lean();

    if (!doc) {
      return NextResponse.json({ error: 'Email record not found' }, { status: 404 });
    }

    const formatted = {
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
      lastEventAt: doc.lastEventAt ? new Date(doc.lastEventAt).toISOString() : undefined,
      events: (doc.events || []).map((e) => ({
        eventType: e.eventType,
        timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : new Date().toISOString(),
        details: e.details || '',
      })),
      eventHistory: (doc.eventHistory || doc.events || []).map((e) => ({
        eventType: e.eventType,
        timestamp: e.timestamp ? new Date(e.timestamp).toISOString() : new Date().toISOString(),
        details: e.details || '',
      })),
      openedAt: doc.openedAt ? new Date(doc.openedAt).toISOString() : undefined,
      clickedAt: doc.clickedAt ? new Date(doc.clickedAt).toISOString() : undefined,
      openedCount: doc.openedCount || 0,
      clickedCount: doc.clickedCount || 0,
      providerMetadata: doc.providerMetadata || undefined,
    };

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching email details:', error);
    return NextResponse.json({ error: 'Failed to retrieve email record' }, { status: 500 });
  }
}
