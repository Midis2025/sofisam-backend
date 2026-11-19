'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useMounted } from '@/lib/useMounted';

interface StatusItem {
  name: string;
  value: number;
  color: string;
}

interface EnquirySummaryProps {
  statusData: StatusItem[];
  formTypeData: StatusItem[];
  period?: '1m' | '3m';
  isLoading?: boolean;
}

export function EnquirySummary({
  statusData,
  formTypeData,
  period = '1m',
  isLoading = false,
}: EnquirySummaryProps) {
  const mounted = useMounted();

  const totalStatus = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const totalForms = formTypeData.reduce((acc, curr) => acc + curr.value, 0);

  // Identify Private Office and Contact counts & percentages
  const privateOfficeItem =
    formTypeData.find((f) => f.name.toLowerCase().includes('private')) || { value: 0 };
  const contactItem =
    formTypeData.find((f) => f.name.toLowerCase().includes('contact')) || { value: 0 };

  const privateOfficePct =
    totalForms > 0 ? Math.round((privateOfficeItem.value / totalForms) * 100) : 0;
  const contactPct =
    totalForms > 0 ? Math.round((contactItem.value / totalForms) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Mandate Distribution</CardTitle>
          <CardDescription>
            {period === '1m'
              ? 'Status & channel breakdown for the latest 30 days'
              : 'Status & channel breakdown for the latest 3 months'}
          </CardDescription>
        </div>
      </CardHeader>

      <div
        className={`p-6 pt-2 flex flex-col justify-between flex-1 space-y-6 transition-opacity duration-200 ${
          isLoading ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {/* Pie Chart or Empty State */}
        <div className="h-[180px] w-full flex items-center justify-center">
          {!mounted ? (
            <div className="text-xs text-[#66625B]">Loading distribution...</div>
          ) : totalStatus === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full border border-dashed border-[#DED7CA] bg-[#FBF9F5] flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-[#66625B]">0</span>
                <span className="text-[10px] text-[#98948D]">Total</span>
              </div>
              <span className="text-[11px] text-[#66625B] mt-2">
                No submissions in this period
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Legend Breakdown */}
        <div className="space-y-2">
          {statusData.map((item) => {
            const percentage = totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0;
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#171717] font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#66625B]">{item.value}</span>
                  <span className="text-[#98948D] font-mono text-[11px] w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Channel Source Comparison Bar */}
        <div className="pt-4 border-t border-[#DED7CA]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#171717]">Channel Source</span>
            <span className="text-[11px] text-[#66625B]">
              {totalForms} {totalForms === 1 ? 'Submission' : 'Submissions'}
            </span>
          </div>

          <div className="w-full bg-[#EEE8DC] h-2.5 rounded-full overflow-hidden flex">
            {totalForms === 0 ? (
              <div className="w-full h-full bg-[#DED7CA]" title="No submissions in period" />
            ) : (
              formTypeData.map((channel, idx) => {
                const pct = (channel.value / totalForms) * 100;
                return (
                  <div
                    key={idx}
                    style={{ width: `${pct}%`, backgroundColor: channel.color }}
                    title={`${channel.name}: ${channel.value}`}
                    className="h-full transition-all duration-300"
                  />
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#66625B] mt-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#171717]" /> Private Office ({privateOfficePct}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#C7A46A]" /> Contact ({contactPct}%)
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
