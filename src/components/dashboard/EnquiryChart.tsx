'use client';

import React from 'react';
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

export interface ChartDataPoint {
  label: string;
  date?: string;
  month?: string;
  enquiries: number;
  contacts: number;
  total: number;
}

interface EnquiryChartProps {
  data: ChartDataPoint[];
  period?: '1m' | '3m';
  onPeriodChange?: (period: '1m' | '3m') => void;
  isLoading?: boolean;
}

export function EnquiryChart({
  data,
  period = '1m',
  onPeriodChange,
  isLoading = false,
}: EnquiryChartProps) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <Card className="h-[380px] flex items-center justify-center">
        <div className="text-xs text-[#66625B]">Loading analytics visualization...</div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle>Enquiry &amp; Contact Volume</CardTitle>
          <CardDescription>
            {period === '1m'
              ? 'Daily trend of incoming private mandates and general inquiries (Latest 30 Days)'
              : 'Monthly trend of incoming private mandates and general inquiries (Latest 3 Months)'}
          </CardDescription>
        </div>

        {/* Range Selector: Last 1M & Last 3M */}
        <div className="flex items-center gap-1 bg-[#F6F2EA] p-1 rounded-lg border border-[#DED7CA]">
          <button
            type="button"
            onClick={() => onPeriodChange?.('1m')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              period === '1m'
                ? 'bg-white text-[#171717] shadow-xs font-semibold'
                : 'text-[#66625B] hover:text-[#171717]'
            }`}
          >
            Last 1M
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange?.('3m')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              period === '3m'
                ? 'bg-white text-[#171717] shadow-xs font-semibold'
                : 'text-[#66625B] hover:text-[#171717]'
            }`}
          >
            Last 3M
          </button>
        </div>
      </CardHeader>

      <div
        className={`p-6 pt-2 h-[320px] w-full transition-opacity duration-200 ${
          isLoading ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#171717" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#171717" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorContacts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C7A46A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C7A46A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DED7CA" />
            <XAxis
              dataKey="label"
              stroke="#66625B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={16}
            />
            <YAxis
              stroke="#66625B"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #DED7CA',
                boxShadow: '0 4px 16px rgba(40,30,15,0.06)',
                fontSize: '12px',
                color: '#171717',
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
              stroke="#171717"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEnquiries)"
            />
            <Area
              type="monotone"
              dataKey="contacts"
              name="Contact Form"
              stroke="#C7A46A"
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
