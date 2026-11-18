'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Enquiry, EnquiryStatus } from '@/types';
import { StatusBadge, PriorityBadge, FormTypeBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
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
  onPageChange: (page: number) => void;
  onStatusChange?: (id: string, newStatus: EnquiryStatus) => void;
  onDeleteEnquiry?: (id: string) => void;
}

export function EnquiryTable({
  enquiries,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
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

  return (
    <div className="bg-white rounded-xl border border-[#E5E9EF] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8F9FA] border-b border-[#E5E9EF] text-[11px] font-semibold uppercase tracking-wider text-[#7C8795]">
            <tr>
              <th className="py-3.5 px-5">Ref ID</th>
              <th className="py-3.5 px-5">Prospect / Client</th>
              <th className="py-3.5 px-5">Company</th>
              <th className="py-3.5 px-5">Channel</th>
              <th className="py-3.5 px-5">Area of Interest</th>
              <th className="py-3.5 px-5">Submitted</th>
              <th className="py-3.5 px-5">Priority</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E9EF] bg-white">
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="max-w-xs mx-auto text-center">
                    <p className="text-sm font-semibold text-[#182536]">No enquiries found</p>
                    <p className="text-xs text-[#7C8795] mt-1">
                      No matching mandate submissions found for the selected criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              enquiries.map((enq) => (
                <tr
                  key={enq._id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Reference ID */}
                  <td className="py-3.5 px-5 whitespace-nowrap font-mono text-xs font-semibold text-[#14243A]">
                    {enq.referenceId}
                  </td>

                  {/* Client / Prospect */}
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#182536] group-hover:text-[#14243A]">
                      {enq.name}
                    </div>
                    <div className="text-xs text-[#7C8795] flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{enq.email}</span>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-3.5 px-5">
                    <div className="text-xs font-medium text-[#182536] flex items-center gap-1">
                      {enq.company ? (
                        <>
                          <Building2 className="w-3 h-3 text-[#B99A62]" />
                          <span>{enq.company}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    {enq.title && (
                      <div className="text-[11px] text-[#7C8795]">{enq.title}</div>
                    )}
                  </td>

                  {/* Channel / Form Type */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <FormTypeBadge formType={enq.formType} />
                  </td>

                  {/* Area of Interest */}
                  <td className="py-3.5 px-5 max-w-[200px] truncate text-xs text-[#182536]">
                    {enq.areaOfInterest || <span className="text-slate-400">—</span>}
                  </td>

                  {/* Submitted */}
                  <td className="py-3.5 px-5 whitespace-nowrap text-xs text-[#7C8795]">
                    {formatDate(enq.submittedAt)}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <PriorityBadge priority={enq.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <StatusBadge status={enq.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/enquiries/${enq._id}`}
                        className="p-1.5 rounded-lg text-[#14243A] hover:bg-slate-100 hover:text-[#B99A62] transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => {
                          setSelectedEnquiry(enq);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E9EF] bg-[#F8F9FA] px-5 py-3 text-xs text-[#7C8795] gap-3">
        <div>
          Showing{' '}
          <span className="font-semibold text-[#182536]">
            {totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-[#182536]">
            {Math.min(currentPage * 10, totalItems)}
          </span>{' '}
          of <span className="font-semibold text-[#182536]">{totalItems}</span> submissions
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-2 py-1 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Previous
          </Button>

          <span className="px-3 font-medium text-[#182536]">
            Page {currentPage} of {totalPages || 1}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-2 py-1 text-xs"
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
              <strong className="font-semibold">{selectedEnquiry?.referenceId}</strong> from{' '}
              <strong className="font-semibold">{selectedEnquiry?.name}</strong>.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
