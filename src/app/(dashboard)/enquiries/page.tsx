'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnquiryFilters } from '@/components/enquiries/EnquiryFilters';
import { EnquiryTable } from '@/components/enquiries/EnquiryTable';
import { MOCK_ENQUIRIES } from '@/lib/mockData';
import { Enquiry, FilterState, EnquiryStatus } from '@/types';
import { exportToCSV } from '@/lib/utils';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(MOCK_ENQUIRIES);
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

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
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

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      // Search term match
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesEmail = item.email.toLowerCase().includes(query);
        const matchesCompany = item.company?.toLowerCase().includes(query);
        const matchesRef = item.referenceId.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesCompany && !matchesRef) {
          return false;
        }
      }

      // Form Type filter
      if (filters.formType !== 'all' && item.formType !== filters.formType) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && item.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'all' && item.priority !== filters.priority) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime();
      const timeB = new Date(b.submittedAt).getTime();
      return filters.sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [enquiries, filters]);

  const totalPages = Math.ceil(filteredEnquiries.length / filters.limit) || 1;
  const paginatedEnquiries = useMemo(() => {
    const startIndex = (filters.page - 1) * filters.limit;
    return filteredEnquiries.slice(startIndex, startIndex + filters.limit);
  }, [filteredEnquiries, filters.page, filters.limit]);

  const handleExportCSV = () => {
    exportToCSV(
      `sofisam-enquiries-${new Date().toISOString().slice(0, 10)}`,
      filteredEnquiries as unknown as Record<string, unknown>[],
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

  const handleDeleteEnquiry = (id: string) => {
    setEnquiries((prev) => prev.filter((item) => item._id !== id));
  };

  const handleStatusChange = (id: string, newStatus: EnquiryStatus) => {
    setEnquiries((prev) =>
      prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <DashboardLayout
      title="Client Mandates & Enquiries"
      subtitle="Complete ledger of Private Office submissions and General Contact requests"
    >
      <div className="space-y-6">
        <EnquiryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onExport={handleExportCSV}
          totalCount={filteredEnquiries.length}
        />

        <EnquiryTable
          enquiries={paginatedEnquiries}
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={filteredEnquiries.length}
          onPageChange={(page) => handleFilterChange({ page })}
          onStatusChange={handleStatusChange}
          onDeleteEnquiry={handleDeleteEnquiry}
        />
      </div>
    </DashboardLayout>
  );
}
