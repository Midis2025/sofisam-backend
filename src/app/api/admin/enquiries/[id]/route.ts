import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Enquiry, { IEnquiry } from '@/models/Enquiry';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

function getQueryFilter(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return {
      $or: [{ _id: id }, { enquiryReference: id }],
    };
  }
  return { enquiryReference: id };
}

function formatEnquiry(doc: IEnquiry) {
  const obj = doc.toObject ? doc.toObject({ virtuals: true }) : doc;
  const name = obj.fullName || obj.nameAndTitle || 'Anonymous Client';
  const company = obj.company || obj.organisation || '';
  const ref = obj.enquiryReference || '';

  return {
    _id: obj._id ? obj._id.toString() : '',
    enquiryReference: ref,
    referenceId: ref,
    formType: obj.formType,
    name,
    fullName: obj.fullName || '',
    nameAndTitle: obj.nameAndTitle || '',
    email: obj.email,
    company,
    organisation: obj.organisation || '',
    areaOfInterest: obj.areaOfInterest || '',
    message: obj.message,
    status: obj.status,
    priority: obj.priority,
    sourcePage: obj.sourcePage,
    adminNotes: (obj.adminNotes || []).map((n: { note?: string; content?: string; createdAt?: Date | string }) => ({
      note: n.note || n.content || '',
      content: n.content || n.note || '',
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
    })),
    emailStatus: obj.emailStatus || {
      adminNotification: 'pending',
      customerAcknowledgement: 'pending',
    },
    submittedAt: obj.submittedAt ? new Date(obj.submittedAt).toISOString() : new Date().toISOString(),
    updatedAt: obj.updatedAt ? new Date(obj.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const filter = getQueryFilter(id);

    const enquiry = await Enquiry.findOne(filter);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: formatEnquiry(enquiry),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching enquiry by ID:', error);
    return NextResponse.json({ error: 'Failed to retrieve enquiry' }, { status: 500 });
  }
}

const UpdateSchema = z.object({
  status: z.enum(['new', 'contacted', 'in_progress', 'converted', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  note: z.string().trim().optional(),
  adminNote: z.string().trim().optional(),
  content: z.string().trim().optional(),
});

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const filter = getQueryFilter(id);

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, priority, note, adminNote, content } = parsed.data;
    const noteText = note || adminNote || content;

    const enquiry = await Enquiry.findOne(filter);
    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    if (status) {
      enquiry.status = status;
    }
    if (priority) {
      enquiry.priority = priority;
    }
    if (noteText) {
      enquiry.adminNotes.push({
        note: noteText,
        createdAt: new Date(),
      });
    }

    enquiry.updatedAt = new Date();
    await enquiry.save();

    return NextResponse.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: formatEnquiry(enquiry),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating enquiry:', error);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { id } = await params;
    const filter = getQueryFilter(id);

    const result = await Enquiry.findOneAndDelete(filter);
    if (!result) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry deleted successfully',
      data: { id: result._id.toString(), reference: result.enquiryReference },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting enquiry:', error);
    return NextResponse.json({ error: 'Failed to delete enquiry' }, { status: 500 });
  }
}
