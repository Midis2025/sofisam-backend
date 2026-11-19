'use client';

import React, { useState } from 'react';
import { NewsletterSubscriber, SubscriberStatus } from '@/types';
import { SubscriberBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Mail,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';

interface SubscriberTableProps {
  subscribers: NewsletterSubscriber[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onToggleStatus: (id: string, newStatus: SubscriberStatus) => void;
}

export function SubscriberTable({
  subscribers,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onToggleStatus,
}: SubscriberTableProps) {
  const [selectedSub, setSelectedSub] = useState<NewsletterSubscriber | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleConfirmToggle = () => {
    if (selectedSub) {
      const nextStatus = selectedSub.status === 'active' ? 'unsubscribed' : 'active';
      onToggleStatus(selectedSub._id, nextStatus);
    }
    setModalOpen(false);
    setSelectedSub(null);
  };

  return (
    <div className="bg-white rounded-xl border border-[#DED7CA] shadow-[0_1px_3px_rgba(40,30,15,0.03)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FBF9F5] border-b border-[#DED7CA] text-[11px] font-semibold uppercase tracking-wider text-[#66625B]">
            <tr>
              <th className="py-3.5 px-6">Subscriber Email</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Source Page</th>
              <th className="py-3.5 px-6">Subscribed Date</th>
              <th className="py-3.5 px-6">Unsubscribed Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEE8DC] bg-white">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <div className="max-w-xs mx-auto text-center">
                    <p className="text-sm font-semibold text-[#171717]">No subscribers found</p>
                    <p className="text-xs text-[#66625B] mt-1">
                      No subscriber matching the selected filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub._id} className="hover:bg-[#F6F2EA]/60 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-semibold text-[#171717] flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#C7A46A]" />
                      <span>{sub.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <SubscriberBadge status={sub.status} />
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[#66625B] truncate max-w-[220px]">
                    <span className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3 h-3 text-[#98948D] shrink-0" />
                      <span className="truncate">{sub.sourcePage}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[#66625B] whitespace-nowrap">
                    {formatDate(sub.subscribedAt)}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[#66625B] whitespace-nowrap">
                    {sub.unsubscribedAt ? formatDate(sub.unsubscribedAt) : '—'}
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <Button
                      variant={sub.status === 'active' ? 'outline' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        setSelectedSub(sub);
                        setModalOpen(true);
                      }}
                      className={
                        sub.status === 'active'
                          ? 'text-xs text-[#9A3F2C] hover:bg-rose-50 hover:border-rose-200'
                          : 'text-xs text-[#2B6B48] bg-emerald-50 hover:bg-emerald-100'
                      }
                    >
                      {sub.status === 'active' ? (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Unsubscribe
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Reactivate
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#DED7CA] bg-[#FBF9F5] px-6 py-3 text-xs text-[#66625B] gap-3">
        <div>
          Showing{' '}
          <span className="font-semibold text-[#171717]">
            {totalItems === 0 ? 0 : (currentPage - 1) * 10 + 1}
          </span>{' '}
          to{' '}
          <span className="font-semibold text-[#171717]">
            {Math.min(currentPage * 10, totalItems)}
          </span>{' '}
          of <span className="font-semibold text-[#171717]">{totalItems}</span> subscribers
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

          <span className="px-3 font-medium text-[#171717]">
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

      {/* Toggle Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          selectedSub?.status === 'active'
            ? 'Confirm Unsubscribe Action'
            : 'Reactivate Subscriber'
        }
        description={
          selectedSub?.status === 'active'
            ? 'This recipient will no longer receive weekly market intelligence or institutional briefs.'
            : 'This recipient will resume receiving SOFISAM market intelligence and insights.'
        }
        confirmLabel={selectedSub?.status === 'active' ? 'Confirm Unsubscribe' : 'Reactivate'}
        confirmVariant={selectedSub?.status === 'active' ? 'danger' : 'primary'}
        onConfirm={handleConfirmToggle}
      >
        <div className="p-3 rounded-lg bg-[#FBF9F5] border border-[#DED7CA] text-xs">
          Subscriber email: <strong className="font-semibold text-[#171717]">{selectedSub?.email}</strong>
        </div>
      </Modal>
    </div>
  );
}
