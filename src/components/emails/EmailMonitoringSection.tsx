'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EmailStats, EmailHealth, EmailLogItem } from '@/types';
import { EmailStatsCards } from './EmailStatsCards';
import { EmailDeliveryHealth } from './EmailDeliveryHealth';
import { EmailActivityTable } from './EmailActivityTable';
import { EmailDetailModal } from './EmailDetailModal';
import { useAutoPoll } from '@/lib/useAutoPoll';

export function EmailMonitoringSection() {
  // State for metrics & health
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [health, setHealth] = useState<EmailHealth | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');

  // State for activity table
  const [emails, setEmails] = useState<EmailLogItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const pageSize = 10;

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(true);

  // Modal state
  const [selectedEmail, setSelectedEmail] = useState<EmailLogItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Polling / Refetch callback for useAutoPoll & Manual Refresh
  const pollAll = useCallback(async () => {
    try {
      const [statsRes, healthRes, tableRes] = await Promise.all([
        fetch(`/api/admin/emails/stats?period=${encodeURIComponent(selectedPeriod)}`, {
          cache: 'no-store',
        }),
        fetch('/api/admin/emails/health', { cache: 'no-store' }),
        (() => {
          const params = new URLSearchParams();
          params.set('page', String(currentPage));
          params.set('limit', String(pageSize));
          if (searchQuery.trim()) params.set('search', searchQuery.trim());
          if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
          if (selectedType && selectedType !== 'all') params.set('type', selectedType);
          return fetch(`/api/admin/emails?${params.toString()}`, { cache: 'no-store' });
        })(),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.data);
      }
      if (tableRes.ok) {
        const tableData = await tableRes.json();
        setEmails(tableData.data || []);
        setTotalPages(tableData.pagination?.totalPages || 1);
        setTotalItems(tableData.pagination?.total || 0);
        setCurrentPage(tableData.pagination?.page || currentPage);
      }
    } catch (err) {
      console.error('Email auto-poll refresh error:', err);
    } finally {
      setIsLoadingStats(false);
      setIsLoadingHealth(false);
      setIsLoadingTable(false);
    }
  }, [selectedPeriod, currentPage, pageSize, searchQuery, selectedStatus, selectedType]);

  // Automatic 30-second background polling with tab visibility detection
  useAutoPoll(pollAll, { interval: 30000, enabled: true });

  // Initial and parameter change load for Stats
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const loadStats = async () => {
      try {
        const res = await fetch(
          `/api/admin/emails/stats?period=${encodeURIComponent(selectedPeriod)}`,
          { cache: 'no-store', signal: controller.signal }
        );
        if (res.ok && !ignore) {
          const data = await res.json();
          setStats(data.data);
        }
      } catch (err: unknown) {
        if (!ignore && (err as Error)?.name !== 'AbortError') {
          console.error('Failed to load email stats:', err);
        }
      } finally {
        if (!ignore) setIsLoadingStats(false);
      }
    };

    loadStats();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [selectedPeriod]);

  // Initial load for Health
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const loadHealth = async () => {
      try {
        const res = await fetch('/api/admin/emails/health', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setHealth(data.data);
        }
      } catch (err: unknown) {
        if (!ignore && (err as Error)?.name !== 'AbortError') {
          console.error('Failed to load email health:', err);
        }
      } finally {
        if (!ignore) setIsLoadingHealth(false);
      }
    };

    loadHealth();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Initial and parameter change load for Table
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const loadEmails = async () => {
      try {
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', String(pageSize));
        if (searchQuery.trim()) params.set('search', searchQuery.trim());
        if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
        if (selectedType && selectedType !== 'all') params.set('type', selectedType);

        const res = await fetch(`/api/admin/emails?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setEmails(data.data || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalItems(data.pagination?.total || 0);
          setCurrentPage(data.pagination?.page || currentPage);
        }
      } catch (err: unknown) {
        if (!ignore && (err as Error)?.name !== 'AbortError') {
          console.error('Failed to load email activity:', err);
        }
      } finally {
        if (!ignore) setIsLoadingTable(false);
      }
    };

    loadEmails();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [currentPage, pageSize, searchQuery, selectedStatus, selectedType]);

  // Manual refresh all
  const handleRefreshAll = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoadingStats(true);
    setIsLoadingHealth(true);
    setIsLoadingTable(true);
    pollAll();
  };

  // Detail view handler
  const handleViewDetails = (email: EmailLogItem) => {
    setSelectedEmail(email);
    setIsDetailModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedType('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Section with Period Selector */}
      <EmailStatsCards
        stats={stats}
        selectedPeriod={selectedPeriod}
        onPeriodChange={(period) => {
          setIsLoadingStats(true);
          setSelectedPeriod(period);
        }}
        isLoading={isLoadingStats}
      />

      {/* Infrastructure & Health Card */}
      <EmailDeliveryHealth
        health={health}
        isLoading={isLoadingHealth}
        onSyncComplete={handleRefreshAll}
      />

      {/* Activity Table with Filters & Pagination */}
      <EmailActivityTable
        emails={emails}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        searchQuery={searchQuery}
        selectedStatus={selectedStatus}
        selectedType={selectedType}
        isLoading={isLoadingTable}
        onPageChange={(p) => {
          setIsLoadingTable(true);
          setCurrentPage(p);
        }}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        onStatusChange={(s) => {
          setIsLoadingTable(true);
          setSelectedStatus(s);
          setCurrentPage(1);
        }}
        onTypeChange={(t) => {
          setIsLoadingTable(true);
          setSelectedType(t);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onViewDetails={handleViewDetails}
        onRefresh={handleRefreshAll}
      />

      {/* Email Details Modal */}
      <EmailDetailModal
        email={selectedEmail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEmail(null);
        }}
      />
    </div>
  );
}
