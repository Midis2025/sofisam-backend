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
}

export function EnquirySummary({ statusData, formTypeData }: EnquirySummaryProps) {
  const mounted = useMounted();

  const totalStatus = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Mandate Distribution</CardTitle>
          <CardDescription>Breakdown by processing status and enquiry channel</CardDescription>
        </div>
      </CardHeader>

      <div className="p-6 pt-2 flex flex-col justify-between flex-1 space-y-6">
        {/* Pie Chart */}
        <div className="h-[180px] w-full flex items-center justify-center">
          {mounted ? (
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
                    border: '1px solid #E5E9EF',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-[#7C8795]">Loading distribution...</div>
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
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#182536] font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#7C8795]">{item.value}</span>
                  <span className="text-slate-400 font-mono text-[11px] w-8 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Type Comparison Bar */}
        <div className="pt-4 border-t border-[#E5E9EF]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-[#182536]">Channel Source</span>
            <span className="text-[11px] text-[#7C8795]">Private vs Contact</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            {formTypeData.map((channel, idx) => {
              const totalForms = formTypeData.reduce((a, b) => a + b.value, 0);
              const pct = totalForms > 0 ? (channel.value / totalForms) * 100 : 0;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%`, backgroundColor: channel.color }}
                  title={`${channel.name}: ${channel.value}`}
                  className="h-full transition-all duration-300"
                />
              );
            })}
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#7C8795] mt-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#14243A]" /> Private Office (63%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#B99A62]" /> Contact (37%)
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
