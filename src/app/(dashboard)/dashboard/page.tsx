'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EnquiryChart } from '@/components/dashboard/EnquiryChart';
import { EnquirySummary } from '@/components/dashboard/EnquirySummary';
import { RecentEnquiries } from '@/components/dashboard/RecentEnquiries';
import { useAutoPoll } from '@/lib/useAutoPoll';
import { Enquiry } from '@/types';
import { Inbox, Mail, Clock, Users, RefreshCw } from 'lucide-react';

interface StatsResponse {
  totalEnquiries: number;
  newSubmissions: number;
  inProgress: number;
  newsletterSubscribers: number;
  activeNewsletterSubscribers: number;
  changes: {
    totalEnquiries: number | null;
    newSubmissions: number | null;
    inProgress: number | null;
    newsletterSubscribers: number | null;
  };
}

interface AnalyticsResponse {
  period?: '1m' | '3m';
  periodLabel?: string;
  monthlyVolume: {
    label: string;
    month: string;
    enquiries: number;
    contacts: number;
    total: number;
  }[];
  statusDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  formTypeDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [period, setPeriod] = useState<'1m' | '3m'>('1m');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const periodRef = useRef<'1m' | '3m'>('1m');

  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setIsRefreshing(true);
    }
    const currentPeriod = periodRef.current;
    try {
      const [statsRes, analyticsRes, recentRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats', { cache: 'no-store' }),
        fetch(`/api/admin/dashboard/analytics?period=${currentPeriod}`, { cache: 'no-store' }),
        fetch('/api/admin/dashboard/recent?limit=5', { cache: 'no-store' }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.data);
        }
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        if (recentData.success) {
          setRecentEnquiries(recentData.data);
        }
      }

      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handlePeriodChange = useCallback(async (newPeriod: '1m' | '3m') => {
    if (newPeriod === periodRef.current) return;
    setPeriod(newPeriod);
    periodRef.current = newPeriod;
    setIsAnalyticsLoading(true);

    try {
      const res = await fetch(`/api/admin/dashboard/analytics?period=${newPeriod}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to switch analytics period:', err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  // Initial load with default 1m period
  useEffect(() => {
    let ignore = false;
    const loadInitial = async () => {
      try {
        const [statsRes, analyticsRes, recentRes] = await Promise.all([
          fetch('/api/admin/dashboard/stats', { cache: 'no-store' }),
          fetch('/api/admin/dashboard/analytics?period=1m', { cache: 'no-store' }),
          fetch('/api/admin/dashboard/recent?limit=5', { cache: 'no-store' }),
        ]);

        if (ignore) return;

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          if (analyticsData.success) {
            setAnalytics(analyticsData.data);
          }
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          if (recentData.success) {
            setRecentEnquiries(recentData.data);
          }
        }

        setLastRefreshedAt(new Date());
      } catch (err) {
        console.error('Failed to load initial dashboard data:', err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // 30-second live polling respecting the current period
  useAutoPoll(() => fetchDashboardData(true), { interval: 30000 });

  return (
    <DashboardLayout
      title="Executive Overview"
      subtitle="SOFISAM Institutional & Advisory Mandates Management"
    >
      <div className="space-y-8">
        {/* Real-time sync indicator */}
        <div className="flex items-center justify-between text-xs text-[#66625B] -mt-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B6B48]"></span>
            </span>
            <span>Live MongoDB Sync (30s polling)</span>
            {lastRefreshedAt && (
              <span className="text-[11px] text-[#98948D]">
                • Updated {lastRefreshedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#171717] hover:bg-[#F6F2EA] rounded-md transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading && !stats ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-xl border border-[#DED7CA] animate-pulse p-6"
              >
                <div className="h-4 bg-[#F6F2EA] rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-[#EEE8DC] rounded w-1/2"></div>
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Total Enquiries"
                value={stats?.totalEnquiries ?? 0}
                change={stats?.changes.totalEnquiries ?? undefined}
                description="All historical mandates"
                icon={Inbox}
                variant="navy"
              />
              <StatCard
                title="New Submissions"
                value={stats?.newSubmissions ?? 0}
                change={stats?.changes.newSubmissions ?? undefined}
                description="Pending initial contact"
                icon={Mail}
                variant="gold"
              />
              <StatCard
                title="In Progress"
                value={stats?.inProgress ?? 0}
                change={stats?.changes.inProgress ?? undefined}
                description="Active review & advisory"
                icon={Clock}
                variant="info"
              />
              <StatCard
                title="Newsletter Subscribers"
                value={stats?.newsletterSubscribers ?? 0}
                change={stats?.changes.newsletterSubscribers ?? undefined}
                description="Active intelligence list"
                icon={Users}
                variant="default"
              />
            </>
          )}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading && !analytics ? (
              <div className="h-[380px] bg-white rounded-xl border border-[#DED7CA] animate-pulse p-6">
                <div className="h-4 bg-[#F6F2EA] rounded w-1/4 mb-6"></div>
                <div className="h-[280px] bg-[#FBF9F5] rounded"></div>
              </div>
            ) : (
              <EnquiryChart
                data={analytics?.monthlyVolume || []}
                period={period}
                onPeriodChange={handlePeriodChange}
                isLoading={isAnalyticsLoading}
              />
            )}
          </div>
          <div>
            {isLoading && !analytics ? (
              <div className="h-[380px] bg-white rounded-xl border border-[#DED7CA] animate-pulse p-6">
                <div className="h-4 bg-[#F6F2EA] rounded w-1/3 mb-6"></div>
                <div className="h-[280px] bg-[#FBF9F5] rounded"></div>
              </div>
            ) : (
              <EnquirySummary
                statusData={analytics?.statusDistribution || []}
                formTypeData={analytics?.formTypeDistribution || []}
                period={period}
                isLoading={isAnalyticsLoading}
              />
            )}
          </div>
        </div>

        {/* Recent Submissions */}
        <RecentEnquiries enquiries={recentEnquiries} />
      </div>
    </DashboardLayout>
  );
}
