import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import NewsletterSubscriber from '@/models/NewsletterSubscriber';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UpdateSchema = z.object({
  status: z.enum(['active', 'unsubscribed']),
});

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid subscriber ID' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid status update', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const subscriber = await NewsletterSubscriber.findById(id);
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    subscriber.status = status;
    if (status === 'unsubscribed') {
      subscriber.unsubscribedAt = new Date();
    } else {
      subscriber.unsubscribedAt = undefined;
    }

    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: `Subscriber marked as ${status}`,
      data: {
        _id: subscriber._id.toString(),
        email: subscriber.email,
        status: subscriber.status,
        sourcePage: subscriber.sourcePage,
        consent: subscriber.consent,
        subscribedAt: subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toISOString() : '',
        unsubscribedAt: subscriber.unsubscribedAt ? new Date(subscriber.unsubscribedAt).toISOString() : undefined,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating newsletter subscriber:', error);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid subscriber ID' }, { status: 400 });
    }

    const result = await NewsletterSubscriber.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscriber removed successfully',
      data: { id: result._id.toString(), email: result.email },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting newsletter subscriber:', error);
    return NextResponse.json({ error: 'Failed to remove subscriber' }, { status: 500 });
  }
}
