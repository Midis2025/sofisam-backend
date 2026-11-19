'use client';

import React from 'react';
import { Search, Download, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FilterState } from '@/types';

interface EnquiryFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  onExport: () => void;
  totalCount: number;
}

export function EnquiryFilters({
  filters,
  onFilterChange,
  onReset,
  onExport,
  totalCount,
}: EnquiryFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-[#DED7CA] p-4.5 shadow-[0_1px_3px_rgba(40,30,15,0.03)] space-y-4">
      {/* Top row: Search & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md lg:max-w-lg">
          <Input
            icon={<Search className="w-4 h-4" />}
            placeholder="Search by prospect name, email, or company..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <span className="hidden md:inline-flex items-center text-xs text-[#66625B] font-medium px-2.5 py-1 bg-[#F6F2EA] rounded-md border border-[#DED7CA]">
            {totalCount} results
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs text-[#66625B] hover:text-[#171717]"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            variant="gold"
            size="sm"
            onClick={onExport}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Bottom row: Filter Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-[#DED7CA]/70">
        <div>
          <label className="block text-[11px] font-semibold text-[#66625B] uppercase tracking-wider mb-1">
            Form Type
          </label>
          <Select
            value={filters.formType}
            onChange={(e) =>
              onFilterChange({
                formType: e.target.value as FilterState['formType'],
                page: 1,
              })
            }
          >
            <option value="all">All Channels</option>
            <option value="private_enquiry">Private Office</option>
            <option value="contact">General Contact</option>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#66625B] uppercase tracking-wider mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value as FilterState['status'],
                page: 1,
              })
            }
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#66625B] uppercase tracking-wider mb-1">
            Priority
          </label>
          <Select
            value={filters.priority}
            onChange={(e) =>
              onFilterChange({
                priority: e.target.value as FilterState['priority'],
                page: 1,
              })
            }
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </Select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-[#66625B] uppercase tracking-wider mb-1">
            Time Range
          </label>
          <Select
            value={filters.dateRange}
            onChange={(e) =>
              onFilterChange({
                dateRange: e.target.value as FilterState['dateRange'],
                page: 1,
              })
            }
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </Select>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1">
          <label className="block text-[11px] font-semibold text-[#66625B] uppercase tracking-wider mb-1">
            Sorting
          </label>
          <Select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value as FilterState['sortBy'],
                page: 1,
              })
            }
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
