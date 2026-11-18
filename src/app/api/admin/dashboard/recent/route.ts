import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get('limit') || '5', 10);
    const limit = isNaN(limitParam) ? 5 : Math.min(Math.max(limitParam, 1), 50);

    const enquiries = await Enquiry.find()
      .sort({ submittedAt: -1 })
      .limit(limit)
      .lean();

    const formatted = enquiries.map((doc) => {
      const name = doc.fullName || doc.nameAndTitle || 'Anonymous Client';
      const company = doc.company || doc.organisation || '';
      const ref = doc.enquiryReference || '';

      return {
        _id: doc._id.toString(),
        enquiryReference: ref,
        referenceId: ref,
        formType: doc.formType,
        name,
        fullName: doc.fullName || '',
        nameAndTitle: doc.nameAndTitle || '',
        email: doc.email,
        company,
        organisation: doc.organisation || '',
        areaOfInterest: doc.areaOfInterest || '',
        message: doc.message,
        status: doc.status,
        priority: doc.priority,
        sourcePage: doc.sourcePage,
        adminNotes: (doc.adminNotes || []).map((n: { note?: string; content?: string; createdAt?: Date | string }) => ({
          note: n.note || n.content || '',
          content: n.content || n.note || '',
          createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        })),
        emailStatus: doc.emailStatus || {
          adminNotification: 'pending',
          customerAcknowledgement: 'pending',
        },
        submittedAt: doc.submittedAt ? new Date(doc.submittedAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching recent enquiries:', error);
    return NextResponse.json({ error: 'Failed to load recent enquiries' }, { status: 500 });
  }
}
