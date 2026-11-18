'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SubscriberTable } from '@/components/newsletter/SubscriberTable';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MOCK_SUBSCRIBERS } from '@/lib/mockData';
import { NewsletterSubscriber, SubscriberStatus } from '@/types';
import { exportToCSV } from '@/lib/utils';
import { Users, UserCheck, UserX, Search, Download, RotateCcw } from 'lucide-react';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(MOCK_SUBSCRIBERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriberStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Key metrics
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.status === 'active').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      if (search.trim() && !sub.email.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && sub.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [subscribers, search, statusFilter]);

  const totalPages = Math.ceil(filteredSubscribers.length / limit) || 1;
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    return filteredSubscribers.slice(startIndex, startIndex + limit);
  }, [filteredSubscribers, currentPage, limit]);

  const handleToggleStatus = (id: string, newStatus: SubscriberStatus) => {
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
  };

  const handleExport = () => {
    exportToCSV(
      `sofisam-subscribers-${new Date().toISOString().slice(0, 10)}`,
      filteredSubscribers as unknown as Record<string, unknown>[],
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
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C8795]">
                Total Subscribers
              </span>
              <div className="text-2xl font-bold text-[#182536] mt-1">{totalSubscribers}</div>
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
              <div className="text-2xl font-bold text-emerald-600 mt-1">{activeSubscribers}</div>
              <p className="text-xs text-[#7C8795] mt-1">
                {totalSubscribers > 0
                  ? `${Math.round((activeSubscribers / totalSubscribers) * 100)}% retention rate`
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
              <div className="text-2xl font-bold text-slate-500 mt-1">{unsubscribedCount}</div>
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
        <SubscriberTable
          subscribers={paginatedList}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSubscribers.length}
          onPageChange={setCurrentPage}
          onToggleStatus={handleToggleStatus}
        />
      </div>
    </DashboardLayout>
  );
}
