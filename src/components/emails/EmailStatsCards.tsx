'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { EmailStats } from '@/types';
import {
  Send,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Eye,
  MousePointerClick,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface EmailStatsCardsProps {
  stats: EmailStats | null;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isLoading?: boolean;
}

const PERIOD_OPTIONS = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7d' },
  { value: '30d', label: 'Last 30d' },
  { value: '90d', label: 'Last 90d' },
  { value: 'all', label: 'All Time' },
];

export function EmailStatsCards({
  stats,
  selectedPeriod,
  onPeriodChange,
  isLoading = false,
}: EmailStatsCardsProps) {
  const totalSent = stats?.totalSent ?? stats?.totalEmails ?? 0;
  const delivered = stats?.delivered ?? 0;
  const inTransit = stats?.inTransit ?? stats?.pending ?? 0;
  const failed = (stats?.failed ?? 0) + (stats?.bounced ?? 0);
  const deliveryRate = stats?.deliveryRate ?? (totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 100);
  const failureRate = stats?.failureRate ?? 0;
  const uniqueOpened = stats?.uniqueOpened ?? stats?.opened ?? 0;
  const openRate = stats?.openRate ?? (delivered > 0 ? Math.round((uniqueOpened / delivered) * 100) : 0);
  const uniqueClicked = stats?.uniqueClicked ?? stats?.clicked ?? 0;
  const clickRate = stats?.clickRate ?? (delivered > 0 ? Math.round((uniqueClicked / delivered) * 100) : 0);

  return (
    <div className="space-y-4">
      {/* Header and Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#171717] uppercase tracking-wider">
            Email Delivery &amp; Engagement Analytics
          </h3>
          <p className="text-xs text-[#66625B]">
            Real-time delivery verification, open analytics &amp; Resend event tracking
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="inline-flex items-center p-1 bg-[#F6F2EA] rounded-lg border border-[#DED7CA] self-start sm:self-auto">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPeriodChange(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                selectedPeriod === opt.value
                  ? 'bg-white text-[#171717] shadow-xs font-semibold'
                  : 'text-[#66625B] hover:text-[#171717]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Total Sent */}
        <Card className="border border-[#DED7CA] shadow-xs relative overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#66625B]">Total Sent</span>
              <div className="w-7 h-7 rounded-lg bg-[#C7A46A]/15 text-[#7A5D33] flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#171717]">
                {isLoading ? '...' : totalSent.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#66625B]">sent</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#7A5D33]">
              <TrendingUp className="w-3 h-3 text-[#C7A46A]" />
              <span>Resend API accepted</span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Delivered */}
        <Card className="border border-[#DED7CA] shadow-xs relative overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#66625B]">Delivered</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#2B6B48] flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#2B6B48]">
                {isLoading ? '...' : delivered.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-[#2B6B48] bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                {isLoading ? '-%' : `${deliveryRate}%`}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#2B6B48]">
              <Percent className="w-3 h-3" />
              <span>Inbox placement</span>
            </div>
          </CardContent>
        </Card>

        {/* 3. In Transit / Delayed */}
        <Card className="border border-[#DED7CA] shadow-xs relative overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#66625B]">In Transit / Delayed</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#C07D2B] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#C07D2B]">
                {isLoading ? '...' : inTransit.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#66625B]">pending</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#C07D2B]">
              <Clock className="w-3 h-3" />
              <span>Awaiting receipt</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Bounced / Failed */}
        <Card className="border border-[#DED7CA] shadow-xs relative overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#66625B]">Bounced / Failed</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#9A3F2C] flex items-center justify-center">
                <AlertOctagon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#9A3F2C]">
                {isLoading ? '...' : failed.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-[#9A3F2C] bg-rose-50 px-1 py-0.5 rounded border border-rose-200">
                {isLoading ? '-%' : `${failureRate}%`}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#9A3F2C]">
              <AlertOctagon className="w-3 h-3" />
              <span>Bounces &amp; failures</span>
            </div>
          </CardContent>
        </Card>

        {/* 5. Opened (Engagement) */}
        <Card className="border border-[#DED7CA] shadow-xs relative overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#66625B]">Opened</span>
              <div className="w-7 h-7 rounded-lg bg-[#C7A46A]/15 text-[#7A5D33] flex items-center justify-center">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#7A5D33]">
                {isLoading ? '...' : uniqueOpened.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-[#7A5D33] bg-[#C7A46A]/15 px-1 py-0.5 rounded border border-[#C7A46A]/30">
                {isLoading ? '-%' : `${openRate}%`}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-[#7A5D33]">
              <Eye className="w-3 h-3 text-[#C7A46A]" />
              <span>Unique recipient opens</span>
            </div>
          </CardContent>
        </Card>

        {/* 6. Clicked (Engagement) */}
        <Card className="border border-[#DED7CA] shadow-xs relative overflow-hidden bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#66625B]">Clicked</span>
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center">
                <MousePointerClick className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-sky-900">
                {isLoading ? '...' : uniqueClicked.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1 py-0.5 rounded border border-sky-200">
                {isLoading ? '-%' : `${clickRate}%`}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[10px] text-sky-800">
              <MousePointerClick className="w-3 h-3" />
              <span>Link engagement</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
