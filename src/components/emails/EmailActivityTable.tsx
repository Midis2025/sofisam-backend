'use client';

import React from 'react';
import { EmailLogItem } from '@/types';
import { EmailStatusBadge } from './EmailStatusBadge';
import { EmailTypeBadge } from './EmailTypeBadge';
import { Button } from '@/components/ui/Button';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  FileText,
  X,
} from 'lucide-react';

interface EmailActivityTableProps {
  emails: EmailLogItem[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  searchQuery: string;
  selectedStatus: string;
  selectedType: string;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onTypeChange: (type: string) => void;
  onResetFilters: () => void;
  onViewDetails: (email: EmailLogItem) => void;
  onRefresh: () => void;
}

function formatTableDateTime(dateString: string | Date | undefined) {
  if (!dateString) return { datePart: '—', timePart: '' };
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { datePart: String(dateString), timePart: '' };
    const datePart = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
    const timePart = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
    return { datePart, timePart };
  } catch {
    return { datePart: String(dateString), timePart: '' };
  }
}

export function EmailActivityTable({
  emails,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  searchQuery,
  selectedStatus,
  selectedType,
  isLoading,
  onPageChange,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onResetFilters,
  onViewDetails,
  onRefresh,
}: EmailActivityTableProps) {
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const hasActiveFilters = searchQuery !== '' || selectedStatus !== 'all' || selectedType !== 'all';

  return (
    <div className="bg-white rounded-xl border border-[#DED7CA] shadow-xs flex flex-col justify-between overflow-hidden w-full">
      {/* Controls & Filter Bar */}
      <div className="p-4 border-b border-[#DED7CA] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C7A46A]" />
            <h3 className="text-sm font-semibold text-[#171717]">Recent Email Activity</h3>
            <span className="text-xs text-[#66625B] font-normal">
              ({totalItems} total logs)
            </span>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs text-[#66625B] hover:text-[#171717]"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin text-[#C7A46A]' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#66625B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search recipient or subject..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF9F5] border border-[#DED7CA] rounded-lg text-[#171717] placeholder-[#66625B] focus:outline-none focus:ring-1 focus:ring-[#C7A46A] focus:border-[#C7A46A] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#FBF9F5] border border-[#DED7CA] rounded-lg text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#C7A46A] focus:border-[#C7A46A]"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="delivered">Delivered</option>
              <option value="sent">Sent (Pending)</option>
              <option value="queued">Queued</option>
              <option value="delivery_delayed">Delivery Delayed</option>
              <option value="bounced">Bounced</option>
              <option value="failed">Failed</option>
              <option value="complained">Complained</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-[#FBF9F5] border border-[#DED7CA] rounded-lg text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#C7A46A] focus:border-[#C7A46A]"
            >
              <option value="all">All Email Types</option>
              <option value="admin_notification">Admin Notification</option>
              <option value="customer_acknowledgement">Client Acknowledgement</option>
              <option value="newsletter_welcome">Newsletter Welcome</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="text-xs text-[#9A3F2C] hover:text-[#9A3F2C] hover:bg-rose-50 w-full justify-center"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FBF9F5] border-b border-[#DED7CA] text-[11px] font-semibold uppercase tracking-wider text-[#66625B]">
            <tr>
              <th className="py-3 px-4">Recipient</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Enquiry Ref</th>
              <th className="py-3 px-4">Dispatched At</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Engagement</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEE8DC] text-[#171717]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#66625B]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#C7A46A]" />
                    <span>Loading email transmission records...</span>
                  </div>
                </td>
              </tr>
            ) : emails.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#66625B]">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Mail className="w-8 h-8 text-[#98948D]" />
                    <p className="font-medium text-[#171717]">No email records found</p>
                    <p className="text-[11px]">
                      {hasActiveFilters
                        ? 'Try clearing active filters or modifying search keywords.'
                        : 'Emails sent via Resend will automatically appear here.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              emails.map((email) => {
                const { datePart, timePart } = formatTableDateTime(email.createdAt);
                return (
                  <tr
                    key={email._id}
                    className="hover:bg-[#F6F2EA]/60 transition-colors"
                  >
                    {/* Recipient */}
                    <td className="py-3.5 px-4 font-medium text-[#171717]">
                      <div className="max-w-[200px] truncate" title={email.recipient}>
                        {email.recipient}
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4">
                      <div className="max-w-[240px] truncate text-[#66625B] font-medium" title={email.subject}>
                        {email.subject}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <EmailTypeBadge type={email.emailType} />
                    </td>

                    {/* Enquiry Ref */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {email.relatedEnquiryReference ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#F6F2EA] text-[#171717] px-2 py-0.5 rounded border border-[#DED7CA]">
                          <FileText className="w-3 h-3 text-[#C7A46A]" />
                          {email.relatedEnquiryReference}
                        </span>
                      ) : (
                        <span className="text-[#98948D]">—</span>
                      )}
                    </td>

                    {/* Sent Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-medium text-[#171717]">{datePart}</span>
                        {timePart && (
                          <span className="text-[11px] text-[#66625B] block">{timePart}</span>
                        )}
                      </div>
                    </td>

                    {/* Delivery Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <EmailStatusBadge status={email.status} />
                    </td>

                    {/* Engagement */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {email.openedCount && email.openedCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A5D33] bg-[#C7A46A]/15 px-2 py-0.5 rounded border border-[#C7A46A]/30">
                          <Eye className="w-3 h-3 text-[#C7A46A]" />
                          Opened ({email.openedCount}x)
                        </span>
                      ) : email.openedAt ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7A5D33] bg-[#C7A46A]/15 px-2 py-0.5 rounded border border-[#C7A46A]/30">
                          <Eye className="w-3 h-3 text-[#C7A46A]" />
                          Opened
                        </span>
                      ) : (
                        <span className="text-[#98948D] text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(email)}
                        className="text-xs h-7 px-2.5 text-[#171717] hover:bg-[#F6F2EA] hover:text-[#7A5D33]"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#DED7CA] bg-[#FBF9F5] gap-3">
        <span className="text-xs text-[#66625B]">
          Showing <span className="font-semibold text-[#171717]">{startIndex}</span> to{' '}
          <span className="font-semibold text-[#171717]">{endIndex}</span> of{' '}
          <span className="font-semibold text-[#171717]">{totalItems}</span> emails
        </span>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="h-7 px-2 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
            Prev
          </Button>

          <span className="px-2 text-xs font-medium text-[#66625B]">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
            className="h-7 px-2 text-xs"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
