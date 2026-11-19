'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Enquiry, EnquiryStatus } from '@/types';
import { StatusBadge, PriorityBadge, FormTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building2,
  AlertTriangle,
} from 'lucide-react';

interface EnquiryTableProps {
  enquiries: Enquiry[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onStatusChange?: (id: string, newStatus: EnquiryStatus) => void;
  onDeleteEnquiry?: (id: string) => void;
}

function formatDateTime(dateString: string | Date) {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      return { datePart: String(dateString), timePart: '' };
    }
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

export function EnquiryTable({
  enquiries,
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onDeleteEnquiry,
}: EnquiryTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const confirmDelete = () => {
    if (selectedEnquiry && onDeleteEnquiry) {
      onDeleteEnquiry(selectedEnquiry._id);
    }
    setDeleteModalOpen(false);
    setSelectedEnquiry(null);
  };

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="bg-white rounded-xl border border-[#DED7CA] shadow-[0_1px_3px_rgba(40,30,15,0.03)] flex flex-col justify-between min-h-[560px] lg:min-h-[640px] overflow-hidden w-full">
      {/* Table Area */}
      <div className="w-full overflow-x-auto lg:overflow-x-visible">
        <table className="w-full text-left text-sm border-collapse">
          {/* Proportional Column Sizing: Sums to 100% */}
          <colgroup>
            <col className="w-[12%] min-w-[105px]" />
            <col className="w-[18%] min-w-[160px]" />
            <col className="w-[14%] min-w-[130px]" />
            <col className="w-[11%] min-w-[100px]" />
            <col className="w-[17%] min-w-[150px]" />
            <col className="w-[11%] min-w-[100px]" />
            <col className="w-[8%] min-w-[75px]" />
            <col className="w-[10%] min-w-[95px]" />
            <col className="w-[7%] min-w-[70px]" />
          </colgroup>

          <thead className="bg-[#FBF9F5] border-b border-[#DED7CA] text-[11px] font-semibold uppercase tracking-wider text-[#66625B]">
            <tr>
              <th className="py-4 px-3 xl:px-4">Ref ID</th>
              <th className="py-4 px-3 xl:px-4">Prospect / Client</th>
              <th className="py-4 px-3 xl:px-4">Company</th>
              <th className="py-4 px-3 xl:px-4">Channel</th>
              <th className="py-4 px-3 xl:px-4">Area of Interest</th>
              <th className="py-4 px-3 xl:px-4">Submitted</th>
              <th className="py-4 px-3 xl:px-4">Priority</th>
              <th className="py-4 px-3 xl:px-4">Status</th>
              <th className="py-4 px-3 xl:px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEE8DC] bg-white">
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-24 text-center">
                  <div className="max-w-xs mx-auto text-center">
                    <div className="w-12 h-12 rounded-full bg-[#F6F2EA] flex items-center justify-center mx-auto mb-3 text-[#66625B]">
                      <Mail className="w-6 h-6 text-[#66625B]" />
                    </div>
                    <p className="text-sm font-semibold text-[#171717]">No enquiries found</p>
                    <p className="text-xs text-[#66625B] mt-1">
                      No matching mandate submissions found for the selected criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              enquiries.map((enq) => {
                const { datePart, timePart } = formatDateTime(enq.submittedAt);
                const ref = enq.referenceId || enq.enquiryReference || '';
                const comp = enq.company || enq.organisation || '';

                return (
                  <tr
                    key={enq._id}
                    className="hover:bg-[#F6F2EA]/60 transition-colors group"
                  >
                    {/* Reference ID */}
                    <td className="py-4 px-3 xl:px-4 whitespace-nowrap font-mono text-xs font-semibold text-[#171717]">
                      {ref}
                    </td>

                    {/* Client / Prospect */}
                    <td className="py-4 px-3 xl:px-4">
                      <div
                        className="font-semibold text-xs text-[#171717] group-hover:text-[#7A5D33] truncate leading-snug transition-colors"
                        title={enq.name}
                      >
                        {enq.name}
                      </div>
                      <div
                        className="text-[11px] text-[#66625B] flex items-center gap-1 mt-0.5 truncate"
                        title={enq.email}
                      >
                        <Mail className="w-3 h-3 text-[#98948D] shrink-0" />
                        <span className="truncate">{enq.email}</span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-3 xl:px-4">
                      <div className="text-xs font-medium text-[#171717] flex items-center gap-1.5 leading-snug">
                        {comp ? (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-[#C7A46A] shrink-0" />
                            <span className="truncate" title={comp}>
                              {comp}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#98948D]">—</span>
                        )}
                      </div>
                      {enq.title && (
                        <div
                          className="text-[11px] text-[#66625B] truncate mt-0.5"
                          title={enq.title}
                        >
                          {enq.title}
                        </div>
                      )}
                    </td>

                    {/* Channel / Form Type */}
                    <td className="py-4 px-3 xl:px-4 whitespace-nowrap">
                      <FormTypeBadge formType={enq.formType} />
                    </td>

                    {/* Area of Interest */}
                    <td className="py-4 px-3 xl:px-4 text-xs text-[#171717]">
                      {enq.areaOfInterest ? (
                        <div
                          className="line-clamp-2 leading-relaxed font-normal text-[#171717]"
                          title={enq.areaOfInterest}
                        >
                          {enq.areaOfInterest}
                        </div>
                      ) : (
                        <span className="text-[#98948D]">—</span>
                      )}
                    </td>

                    {/* Submitted */}
                    <td className="py-4 px-3 xl:px-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-[#171717] leading-tight">
                        {datePart}
                      </div>
                      {timePart && (
                        <div className="text-[11px] text-[#66625B] font-mono mt-0.5">
                          {timePart}
                        </div>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-3 xl:px-4 whitespace-nowrap">
                      <PriorityBadge priority={enq.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-3 xl:px-4 whitespace-nowrap">
                      <StatusBadge status={enq.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 xl:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/enquiries/${enq._id}`}
                          className="p-1.5 rounded-lg text-[#171717] hover:bg-[#F6F2EA] hover:text-[#7A5D33] transition-colors"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-[#98948D] hover:text-[#9A3F2C] hover:bg-rose-50 transition-colors"
                          title="Delete Enquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#DED7CA] bg-[#FBF9F5] px-4 sm:px-6 py-3.5 text-xs text-[#66625B] gap-3 mt-auto">
        <div className="flex items-center gap-3">
          <div>
            Showing <span className="font-semibold text-[#171717]">{startIndex}</span> to{' '}
            <span className="font-semibold text-[#171717]">{endIndex}</span> of{' '}
            <span className="font-semibold text-[#171717]">{totalItems}</span> submissions
          </div>

          {onPageSizeChange && (
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-[#DED7CA]">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-white border border-[#DED7CA] rounded px-1.5 py-0.5 text-xs text-[#171717] focus:border-[#C7A46A] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-2.5 py-1 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Previous
          </Button>

          <span className="px-2.5 font-medium text-[#171717]">
            Page {currentPage} of {totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2.5 py-1 text-xs"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Enquiry Submission"
        description="This action cannot be undone. All correspondence records for this reference will be permanently removed."
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        onConfirm={confirmDelete}
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              You are about to delete enquiry{' '}
              <strong className="font-semibold">
                {selectedEnquiry?.referenceId || selectedEnquiry?.enquiryReference}
              </strong>{' '}
              from <strong className="font-semibold">{selectedEnquiry?.name}</strong>.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
