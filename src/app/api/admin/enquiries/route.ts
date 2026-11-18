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
    const search = (searchParams.get('search') || '').trim();
    const formType = searchParams.get('formType');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dateRange = searchParams.get('dateRange');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10), 1), 100);

    // Build Mongo query filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // 1. Text search
    if (search) {
      const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      filter.$or = [
        { enquiryReference: searchRegex },
        { fullName: searchRegex },
        { nameAndTitle: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { organisation: searchRegex },
        { areaOfInterest: searchRegex },
      ];
    }

    // 2. Form Type filter
    if (formType && formType !== 'all') {
      filter.formType = formType;
    }

    // 3. Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // 4. Priority filter
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // 5. Date Range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let days = 0;
      if (dateRange === '7d') days = 7;
      else if (dateRange === '30d') days = 30;
      else if (dateRange === '90d') days = 90;

      if (days > 0) {
        const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filter.submittedAt = { $gte: threshold };
      }
    }

    // Sort condition
    const sortOrder: Record<string, 1 | -1> =
      sortBy === 'oldest' ? { submittedAt: 1 } : { submittedAt: -1 };

    const skip = (page - 1) * limit;

    const [total, enquiries] = await Promise.all([
      Enquiry.countDocuments(filter),
      Enquiry.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

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
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching enquiries:', error);
    return NextResponse.json({ error: 'Failed to load enquiries' }, { status: 500 });
  }
}
