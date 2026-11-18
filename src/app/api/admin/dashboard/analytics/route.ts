import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<
  string,
  { name: string; color: string }
> = {
  new: { name: 'New', color: '#2563EB' },
  contacted: { name: 'Contacted', color: '#B99A62' },
  in_progress: { name: 'In Progress', color: '#D97706' },
  converted: { name: 'Converted', color: '#059669' },
  closed: { name: 'Closed', color: '#6B7280' },
};

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period') || '6m';
    const monthsCount = periodParam === '3m' ? 3 : periodParam === '12m' ? 12 : 6;

    // Build array of past N calendar months (including current month)
    const now = new Date();
    const targetMonths: { year: number; month: number; label: string }[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      targetMonths.push({
        year: d.getFullYear(),
        month: d.getMonth() + 1, // 1-12
        label: d.toLocaleString('en-US', { month: 'short' }),
      });
    }

    const startOfPeriod = new Date(
      targetMonths[0].year,
      targetMonths[0].month - 1,
      1,
      0,
      0,
      0,
      0
    );

    // 1. Monthly Volume aggregation
    const monthlyAgg = await Enquiry.aggregate([
      {
        $match: {
          submittedAt: { $gte: startOfPeriod },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$submittedAt' },
            month: { $month: '$submittedAt' },
            formType: '$formType',
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Map aggregation results into lookup
    const countsMap = new Map<string, number>();
    for (const item of monthlyAgg) {
      const key = `${item._id.year}-${item._id.month}-${item._id.formType}`;
      countsMap.set(key, item.count);
    }

    const monthlyVolume = targetMonths.map((tm) => {
      const privateCount = countsMap.get(`${tm.year}-${tm.month}-private_enquiry`) || 0;
      const contactCount = countsMap.get(`${tm.year}-${tm.month}-contact`) || 0;
      const total = privateCount + contactCount;

      return {
        month: tm.label,
        year: tm.year,
        // Properties for Recharts and EnquiryChart compatibility
        enquiries: privateCount,
        contacts: contactCount,
        privateEnquiries: privateCount,
        contactForms: contactCount,
        total,
      };
    });

    // 2. Status Distribution across all enquiries
    const statusAgg = await Enquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts: Record<string, number> = {
      new: 0,
      contacted: 0,
      in_progress: 0,
      converted: 0,
      closed: 0,
    };

    let totalEnquiriesAll = 0;
    for (const item of statusAgg) {
      if (item._id && typeof item._id === 'string') {
        statusCounts[item._id] = item.count;
        totalEnquiriesAll += item.count;
      }
    }

    const statusDistribution = Object.entries(STATUS_CONFIG).map(([statusKey, cfg]) => {
      const count = statusCounts[statusKey] || 0;
      const percentage =
        totalEnquiriesAll > 0 ? Math.round((count / totalEnquiriesAll) * 100) : 0;
      return {
        status: statusKey,
        name: cfg.name,
        value: count, // for PieChart
        count,
        percentage,
        color: cfg.color,
      };
    });

    // 3. Channel Distribution (Private vs Contact)
    const channelAgg = await Enquiry.aggregate([
      {
        $group: {
          _id: '$formType',
          count: { $sum: 1 },
        },
      },
    ]);

    let privateCount = 0;
    let contactCount = 0;
    for (const item of channelAgg) {
      if (item._id === 'private_enquiry') {
        privateCount = item.count;
      } else if (item._id === 'contact') {
        contactCount = item.count;
      }
    }

    const formTypeDistribution = [
      { name: 'Private Enquiry', value: privateCount, count: privateCount, color: '#14243A' },
      { name: 'Contact Form', value: contactCount, count: contactCount, color: '#B99A62' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        monthlyVolume,
        statusDistribution,
        formTypeDistribution,
        channelDistribution: {
          privateEnquiries: privateCount,
          contactForms: contactCount,
        },
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
