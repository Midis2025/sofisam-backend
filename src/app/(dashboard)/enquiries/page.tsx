'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnquiryFilters } from '@/components/enquiries/EnquiryFilters';
import { EnquiryTable } from '@/components/enquiries/EnquiryTable';
import { useAutoPoll } from '@/lib/useAutoPoll';
import { Enquiry, FilterState, EnquiryStatus } from '@/types';
import { exportToCSV } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    formType: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    sortBy: 'newest',
    page: 1,
    limit: 10,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchEnquiries = useCallback(
    async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const params = new URLSearchParams();
        if (filters.search.trim()) params.set('search', filters.search.trim());
        if (filters.formType !== 'all') params.set('formType', filters.formType);
        if (filters.status !== 'all') params.set('status', filters.status);
        if (filters.priority !== 'all') params.set('priority', filters.priority);
        if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
        params.set('sortBy', filters.sortBy);
        params.set('page', filters.page.toString());
        params.set('limit', filters.limit.toString());

        const res = await fetch(`/api/admin/enquiries?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setEnquiries(data.data);
            setTotalItems(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
          }
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          console.error('Failed to fetch enquiries:', err);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const loadEnquiries = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.search.trim()) params.set('search', filters.search.trim());
        if (filters.formType !== 'all') params.set('formType', filters.formType);
        if (filters.status !== 'all') params.set('status', filters.status);
        if (filters.priority !== 'all') params.set('priority', filters.priority);
        if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
        params.set('sortBy', filters.sortBy);
        params.set('page', filters.page.toString());
        params.set('limit', filters.limit.toString());

        const res = await fetch(`/api/admin/enquiries?${params.toString()}`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (ignore) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success && !ignore) {
            setEnquiries(data.data);
            setTotalItems(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
          }
        }
      } catch (err: unknown) {
        if (!ignore && (err as Error)?.name !== 'AbortError') {
          console.error('Failed to load enquiries:', err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadEnquiries();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [filters]);

  // 30s auto polling
  useAutoPoll(() => fetchEnquiries(), { interval: 30000 });

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      // Reset to page 1 if any filter other than page changes
      page: updates.page !== undefined ? updates.page : 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      formType: 'all',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      sortBy: 'newest',
      page: 1,
      limit: 10,
    });
  };

  const handleExportCSV = () => {
    exportToCSV(
      `sofisam-enquiries-${new Date().toISOString().slice(0, 10)}`,
      enquiries as unknown as Record<string, unknown>[],
      [
        { label: 'Reference ID', key: 'referenceId' },
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Company', key: 'company' },
        { label: 'Form Type', key: 'formType' },
        { label: 'Area of Interest', key: 'areaOfInterest' },
        { label: 'Status', key: 'status' },
        { label: 'Priority', key: 'priority' },
        { label: 'Submitted At', key: 'submittedAt' },
        { label: 'Message', key: 'message' },
      ]
    );
  };

  const handleDeleteEnquiry = async (id: string) => {
    // Optimistic UI update
    setEnquiries((prev) => prev.filter((item) => item._id !== id));
    setTotalItems((prev) => Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        // Revert on failure
        fetchEnquiries();
      }
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
      fetchEnquiries();
    }
  };

  const handleStatusChange = async (id: string, newStatus: EnquiryStatus) => {
    // Optimistic UI update
    setEnquiries((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        fetchEnquiries();
      }
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
      fetchEnquiries();
    }
  };

  return (
    <DashboardLayout
      title="Client Mandates & Enquiries"
      subtitle="Complete ledger of Private Office submissions and General Contact requests"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-[#7C8795] -mt-2">
          <span>{totalItems} total records in MongoDB</span>
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchEnquiries();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#14243A] hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        <EnquiryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onExport={handleExportCSV}
          totalCount={totalItems}
        />

        {isLoading && enquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E9EF] p-12 text-center text-xs text-[#7C8795]">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-slate-300 border-t-[#14243A] rounded-full mb-3"></div>
            <p>Loading enquiries from database...</p>
          </div>
        ) : (
          <EnquiryTable
            enquiries={enquiries}
            currentPage={filters.page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={(page) => handleFilterChange({ page })}
            onStatusChange={handleStatusChange}
            onDeleteEnquiry={handleDeleteEnquiry}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
