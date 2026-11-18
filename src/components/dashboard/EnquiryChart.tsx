'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useMounted } from '@/lib/useMounted';

interface MonthlyData {
  month: string;
  enquiries: number;
  contacts: number;
  total: number;
}

interface EnquiryChartProps {
  data: MonthlyData[];
}

export function EnquiryChart({ data }: EnquiryChartProps) {
  const mounted = useMounted();
  const [timeRange, setTimeRange] = useState<'6m' | '3m' | '1y'>('6m');

  const filteredData = React.useMemo(() => {
    if (timeRange === '3m') {
      return data.slice(-3);
    }
    return data;
  }, [data, timeRange]);

  if (!mounted) {
    return (
      <Card className="h-[380px] flex items-center justify-center">
        <div className="text-xs text-[#7C8795]">Loading analytics visualization...</div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle>Enquiry & Contact Volume</CardTitle>
          <CardDescription>Monthly trend of incoming private mandates and general inquiries</CardDescription>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-[#F6F7F9] p-1 rounded-lg border border-[#E5E9EF]">
          <button
            onClick={() => setTimeRange('3m')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              timeRange === '3m'
                ? 'bg-white text-[#14243A] shadow-xs'
                : 'text-[#7C8795] hover:text-[#182536]'
            }`}
          >
            Last 3M
          </button>
          <button
            onClick={() => setTimeRange('6m')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              timeRange === '6m'
                ? 'bg-white text-[#14243A] shadow-xs'
                : 'text-[#7C8795] hover:text-[#182536]'
            }`}
          >
            Last 6M
          </button>
        </div>
      </CardHeader>

      <div className="p-6 pt-2 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14243A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#14243A" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B99A62" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#B99A62" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9EF" />
            <XAxis
              dataKey="month"
              stroke="#7C8795"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#7C8795"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E5E9EF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                fontSize: '12px',
                color: '#182536',
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="enquiries"
              name="Private Enquiries"
              stroke="#14243A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEnquiries)"
            />
            <Area
              type="monotone"
              dataKey="contacts"
              name="Contact Form"
              stroke="#B99A62"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorContacts)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
