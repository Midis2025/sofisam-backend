import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<
  string,
  { name: string; color: string }
> = {
  new: { name: 'New', color: '#C7A46A' },
  contacted: { name: 'Contacted', color: '#7A5D33' },
  in_progress: { name: 'In Progress', color: '#C07D2B' },
  converted: { name: 'Converted', color: '#2B6B48' },
  closed: { name: 'Closed', color: '#66625B' },
};

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period') || '1m';
    const now = new Date();

    let startOfPeriod: Date;
    let volumeData: Array<{
      label: string;
      date: string;
      month: string;
      year: number;
      day?: number;
      enquiries: number;
      contacts: number;
      privateEnquiries: number;
      contactForms: number;
      total: number;
    }> = [];

    if (periodParam === '3m' || periodParam === '6m' || periodParam === '12m') {
      // Monthly aggregation for 3m (or legacy 6m/12m)
      const monthsCount = periodParam === '6m' ? 6 : periodParam === '12m' ? 12 : 3;
      const targetMonths: { year: number; month: number; label: string }[] = [];

      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        targetMonths.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1, // 1-12
          label: d.toLocaleString('en-US', { month: 'short' }),
        });
      }

      startOfPeriod = new Date(
        targetMonths[0].year,
        targetMonths[0].month - 1,
        1,
        0,
        0,
        0,
        0
      );

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

      const countsMap = new Map<string, number>();
      for (const item of monthlyAgg) {
        const key = `${item._id.year}-${item._id.month}-${item._id.formType}`;
        countsMap.set(key, item.count);
      }

      volumeData = targetMonths.map((tm) => {
        const privateCount = countsMap.get(`${tm.year}-${tm.month}-private_enquiry`) || 0;
        const contactCount = countsMap.get(`${tm.year}-${tm.month}-contact`) || 0;
        const total = privateCount + contactCount;

        return {
          label: tm.label,
          date: tm.label,
          month: tm.label,
          year: tm.year,
          enquiries: privateCount,
          contacts: contactCount,
          privateEnquiries: privateCount,
          contactForms: contactCount,
          total,
        };
      });
    } else {
      // Default: Last 1M (Latest 30 rolling days with daily aggregation)
      const targetDays: {
        year: number;
        month: number;
        day: number;
        date: string;
        label: string;
      }[] = [];

      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        targetDays.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          date: d.toISOString().slice(0, 10),
          label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        });
      }

      startOfPeriod = new Date(
        targetDays[0].year,
        targetDays[0].month - 1,
        targetDays[0].day,
        0,
        0,
        0,
        0
      );

      const dailyAgg = await Enquiry.aggregate([
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
              day: { $dayOfMonth: '$submittedAt' },
              formType: '$formType',
            },
            count: { $sum: 1 },
          },
        },
      ]);

      const countsMap = new Map<string, number>();
      for (const item of dailyAgg) {
        const key = `${item._id.year}-${item._id.month}-${item._id.day}-${item._id.formType}`;
        countsMap.set(key, item.count);
      }

      volumeData = targetDays.map((td) => {
        const privateCount =
          countsMap.get(`${td.year}-${td.month}-${td.day}-private_enquiry`) || 0;
        const contactCount = countsMap.get(`${td.year}-${td.month}-${td.day}-contact`) || 0;
        const total = privateCount + contactCount;

        return {
          label: td.label,
          date: td.label,
          month: td.label, // Backwards compatible with Recharts dataKey="month"
          year: td.year,
          day: td.day,
          enquiries: privateCount,
          contacts: contactCount,
          privateEnquiries: privateCount,
          contactForms: contactCount,
          total,
        };
      });
    }

    // 2. Status Distribution filtered to the selected period
    const statusAgg = await Enquiry.aggregate([
      {
        $match: {
          submittedAt: { $gte: startOfPeriod },
        },
      },
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

    let totalPeriodEnquiries = 0;
    for (const item of statusAgg) {
      if (item._id && typeof item._id === 'string' && statusCounts[item._id] !== undefined) {
        statusCounts[item._id] = item.count;
        totalPeriodEnquiries += item.count;
      }
    }

    const statusDistribution = Object.entries(STATUS_CONFIG).map(([statusKey, cfg]) => {
      const count = statusCounts[statusKey] || 0;
      const percentage =
        totalPeriodEnquiries > 0 ? Math.round((count / totalPeriodEnquiries) * 100) : 0;
      return {
        status: statusKey,
        name: cfg.name,
        value: count, // for PieChart
        count,
        percentage,
        color: cfg.color,
      };
    });

    // 3. Channel Distribution filtered to the selected period (Private Office vs Contact)
    const channelAgg = await Enquiry.aggregate([
      {
        $match: {
          submittedAt: { $gte: startOfPeriod },
        },
      },
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
      { name: 'Private Office', value: privateCount, count: privateCount, color: '#171717' },
      { name: 'Contact', value: contactCount, count: contactCount, color: '#C7A46A' },
    ];

    return NextResponse.json({
      success: true,
      data: {
        period: periodParam === '3m' ? '3m' : '1m',
        periodLabel: periodParam === '3m' ? 'Last 3 Months' : 'Last 30 Days',
        volume: volumeData,
        monthlyVolume: volumeData, // Backwards compatibility alias
        statusDistribution,
        formTypeDistribution,
        channelDistribution: {
          privateEnquiries: privateCount,
          contactForms: contactCount,
          privateOffice: privateCount,
          contact: contactCount,
        },
        totalPeriodEnquiries,
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
