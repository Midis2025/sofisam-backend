'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SubscriberTable } from '@/components/newsletter/SubscriberTable';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAutoPoll } from '@/lib/useAutoPoll';
import { NewsletterSubscriber, SubscriberStatus } from '@/types';
import { exportToCSV } from '@/lib/utils';
import { Users, UserCheck, UserX, Search, Download, RotateCcw, RefreshCw } from 'lucide-react';

interface Metrics {
  total: number;
  active: number;
  unsubscribed: number;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, active: 0, unsubscribed: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriberStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatching, setTotalMatching] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const limit = 10;

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSubscribers = useCallback(
    async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (statusFilter !== 'all') params.set('status', statusFilter);
        params.set('page', currentPage.toString());
        params.set('limit', limit.toString());

        const res = await fetch(`/api/admin/newsletter?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSubscribers(data.data);
            setMetrics(data.metrics);
            setTotalMatching(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error('Failed to fetch subscribers:', err);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [search, statusFilter, currentPage, limit]
  );

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const loadSubscribers = async () => {
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (statusFilter !== 'all') params.set('status', statusFilter);
        params.set('page', currentPage.toString());
        params.set('limit', limit.toString());

        const res = await fetch(`/api/admin/newsletter?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (ignore) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success && !ignore) {
            setSubscribers(data.data);
            setMetrics(data.metrics);
            setTotalMatching(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
          }
        }
      } catch (err: unknown) {
        if (!ignore && (err as Error)?.name !== 'AbortError') {
          console.error('Failed to load subscribers:', err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadSubscribers();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [search, statusFilter, currentPage, limit]);

  // 30s auto polling
  useAutoPoll(() => fetchSubscribers(), { interval: 30000 });

  const handleToggleStatus = async (id: string, newStatus: SubscriberStatus) => {
    // Optimistic UI update
    setSubscribers((prev) =>
      prev.map((sub) => {
        if (sub._id === id) {
          return {
            ...sub,
            status: newStatus,
            unsubscribedAt: newStatus === 'unsubscribed' ? new Date().toISOString() : undefined,
          };
        }
        return sub;
      })
    );

    // Update metrics optimistically
    setMetrics((prev) => {
      const activeDiff = newStatus === 'active' ? 1 : -1;
      const unsubDiff = newStatus === 'unsubscribed' ? 1 : -1;
      return {
        ...prev,
        active: Math.max(0, prev.active + activeDiff),
        unsubscribed: Math.max(0, prev.unsubscribed + unsubDiff),
      };
    });

    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        fetchSubscribers();
      }
    } catch (err) {
      console.error('Failed to update subscriber status:', err);
      fetchSubscribers();
    }
  };

  const handleExport = () => {
    exportToCSV(
      `sofisam-subscribers-${new Date().toISOString().slice(0, 10)}`,
      subscribers as unknown as Record<string, unknown>[],
      [
        { label: 'Email', key: 'email' },
        { label: 'Status', key: 'status' },
        { label: 'Source Page', key: 'sourcePage' },
        { label: 'Subscribed At', key: 'subscribedAt' },
        { label: 'Unsubscribed At', key: 'unsubscribedAt' },
      ]
    );
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <DashboardLayout
      title="Newsletter Intelligence Ledger"
      subtitle="Audience subscriptions for SOFISAM macroeconomic and private office publications"
    >
      <div className="space-y-6">
        {/* Real-time sync indicator */}
        <div className="flex items-center justify-between text-xs text-[#7C8795] -mt-2">
          <span>{metrics.total} total subscribers in MongoDB</span>
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchSubscribers();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#14243A] hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C8795]">
                Total Subscribers
              </span>
              <div className="text-2xl font-bold text-[#182536] mt-1">{metrics.total}</div>
              <p className="text-xs text-[#7C8795] mt-1">All recorded email signups</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-[#14243A]">
              <Users className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C8795]">
                Active Subscriptions
              </span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{metrics.active}</div>
              <p className="text-xs text-[#7C8795] mt-1">
                {metrics.total > 0
                  ? `${Math.round((metrics.active / metrics.total) * 100)}% active rate`
                  : '100%'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C8795]">
                Unsubscribed
              </span>
              <div className="text-2xl font-bold text-slate-500 mt-1">{metrics.unsubscribed}</div>
              <p className="text-xs text-[#7C8795] mt-1">Opted out from newsletters</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <UserX className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-[#E5E9EF] p-4.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:max-w-xl">
            <div className="w-full sm:w-80">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Search subscriber email address..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'all' | SubscriberStatus);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="unsubscribed">Unsubscribed Only</option>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs text-[#7C8795]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleExport}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Subscriber Table */}
        {isLoading && subscribers.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E9EF] p-12 text-center text-xs text-[#7C8795]">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-slate-300 border-t-[#14243A] rounded-full mb-3"></div>
            <p>Loading subscriber records...</p>
          </div>
        ) : (
          <SubscriberTable
            subscribers={subscribers}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalMatching}
            onPageChange={setCurrentPage}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
