'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { EmailLogItem, EmailTimelineEvent } from '@/types';
import { EmailStatusBadge } from './EmailStatusBadge';
import { EmailTypeBadge } from './EmailTypeBadge';
import {
  Copy,
  Check,
  Mail,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  MousePointerClick,
  CheckCircle2,
} from 'lucide-react';

interface EmailDetailModalProps {
  email: EmailLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatFullDateTime(dateVal: string | Date | undefined): string {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return String(dateVal);
  }
}

export function EmailDetailModal({ email, isOpen, onClose }: EmailDetailModalProps) {
  const [copiedId, setCopiedId] = useState(false);

  if (!email) return null;

  const handleCopyId = () => {
    if (email.resendEmailId) {
      navigator.clipboard.writeText(email.resendEmailId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const events: EmailTimelineEvent[] = email.eventHistory || email.events || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Transmission Details"
      description={`Tracking audit for Resend dispatch #${email._id}`}
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
        {/* Top Status & Type Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#FBF9F5] rounded-xl border border-[#DED7CA]">
          <div className="flex items-center gap-2">
            <EmailStatusBadge status={email.status} />
            <EmailTypeBadge type={email.emailType} />
          </div>
          {email.relatedEnquiryReference && (
            <div className="text-xs text-[#66625B] flex items-center gap-1 font-mono">
              <FileText className="w-3.5 h-3.5 text-[#C7A46A]" />
              <span>Ref: {email.relatedEnquiryReference}</span>
            </div>
          )}
        </div>

        {/* Resend Identifier & Copy */}
        <div className="p-3 bg-[#FBF9F5] rounded-lg border border-[#DED7CA]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#66625B]">
              Resend Message Identifier
            </span>
            {email.resendEmailId && (
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 text-[11px] text-[#7A5D33] hover:text-[#C7A46A] font-semibold cursor-pointer"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-[#2B6B48]" />
                    <span className="text-[#2B6B48]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="mt-1 font-mono text-xs text-[#171717] break-all select-all font-semibold">
            {email.resendEmailId || 'Pending Resend provider acknowledgment'}
          </p>
        </div>

        {/* Delivery & Engagement Status Cards (Requirement 8) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg bg-white border border-[#DED7CA]">
            <span className="text-[10px] uppercase font-semibold text-[#66625B] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#2B6B48]" />
              Delivered
            </span>
            <p className="text-[#171717] font-semibold mt-1">
              {email.deliveredAt ? formatFullDateTime(email.deliveredAt) : (email.status === 'delivered' ? 'Confirmed' : 'Pending')}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#DED7CA]">
            <span className="text-[10px] uppercase font-semibold text-[#66625B] flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#7A5D33]" />
              Opens
            </span>
            <p className="text-[#171717] font-semibold mt-1">
              {email.openedCount && email.openedCount > 0
                ? `${email.openedCount} open${email.openedCount > 1 ? 's' : ''}`
                : (email.openedAt ? 'Opened' : '0')}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#DED7CA]">
            <span className="text-[10px] uppercase font-semibold text-[#66625B] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C7A46A]" />
              First Opened
            </span>
            <p className="text-[#171717] font-medium mt-1 truncate" title={formatFullDateTime(email.openedAt)}>
              {email.openedAt ? formatFullDateTime(email.openedAt) : 'Not opened yet'}
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#DED7CA]">
            <span className="text-[10px] uppercase font-semibold text-[#66625B] flex items-center gap-1">
              <MousePointerClick className="w-3 h-3 text-sky-700" />
              Clicks
            </span>
            <p className="text-[#171717] font-semibold mt-1">
              {email.clickedCount && email.clickedCount > 0
                ? `${email.clickedCount} click${email.clickedCount > 1 ? 's' : ''}`
                : (email.clickedAt ? 'Clicked' : '0')}
            </p>
          </div>
        </div>

        {/* Message Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[#66625B] font-semibold flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5 text-[#171717]" />
              Recipient
            </span>
            <p className="text-[#171717] font-medium break-all">{email.recipient}</p>
          </div>

          <div>
            <span className="text-[#66625B] font-semibold flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5 text-[#171717]" />
              Sender
            </span>
            <p className="text-[#171717] font-medium break-all">{email.sender || 'SOFISAM <onboarding@resend.dev>'}</p>
          </div>

          <div className="md:col-span-2">
            <span className="text-[#66625B] font-semibold mb-1 block">Subject</span>
            <p className="text-[#171717] font-medium bg-[#FBF9F5] p-2.5 rounded-lg border border-[#DED7CA]">
              {email.subject}
            </p>
          </div>

          <div>
            <span className="text-[#66625B] font-semibold flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-[#66625B]" />
              Dispatched At (Sent)
            </span>
            <p className="text-[#171717]">{formatFullDateTime(email.sentAt || email.createdAt)}</p>
          </div>

          <div>
            <span className="text-[#66625B] font-semibold flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#66625B]" />
              Last Event Timestamp
            </span>
            <p className="text-[#171717]">{formatFullDateTime(email.lastEventAt || email.updatedAt)}</p>
          </div>
        </div>

        {/* Failure / Bounce Diagnostics (if applicable) */}
        {(email.errorMessage || email.bounceReason || email.errorCode) && (
          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
            <div className="flex items-center gap-2 text-[#9A3F2C] font-semibold mb-1">
              <AlertTriangle className="w-4 h-4 text-[#9A3F2C] shrink-0" />
              <span>Delivery Failure Diagnostics</span>
            </div>
            {email.errorCode && (
              <p className="text-[#9A3F2C]">
                <span className="font-semibold">Error Code:</span> {email.errorCode}
              </p>
            )}
            {email.errorMessage && (
              <p className="text-[#9A3F2C] mt-0.5">
                <span className="font-semibold">Reason:</span> {email.errorMessage}
              </p>
            )}
            {email.bounceReason && (
              <p className="text-[#9A3F2C] mt-0.5">
                <span className="font-semibold">Bounce Details:</span> {email.bounceReason}
              </p>
            )}
            {email.bounceType && (
              <p className="text-[#9A3F2C] mt-0.5">
                <span className="font-semibold">Type:</span> {email.bounceType} ({email.bounceSubtype || 'standard'})
              </p>
            )}
          </div>
        )}

        {/* Chronological Event Timeline */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#171717] mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C7A46A]" />
            Chronological Delivery Timeline
          </h4>

          {events.length === 0 ? (
            <p className="text-xs text-[#66625B] italic p-3 bg-[#FBF9F5] rounded-lg border border-[#DED7CA]">
              No webhook events recorded yet. Waiting for provider confirmation...
            </p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DED7CA]">
              {events.map((evt, idx) => {
                const eventTitle = evt.name || evt.eventType;
                const isDelivered = eventTitle.includes('delivered') || evt.status === 'delivered';
                const isOpened = eventTitle.includes('opened');
                const isClicked = eventTitle.includes('clicked');
                const isFailed =
                  eventTitle.includes('bounced') ||
                  eventTitle.includes('failed') ||
                  evt.status === 'bounced' ||
                  evt.status === 'failed';
                const isSent = eventTitle.includes('sent') || evt.status === 'sent';

                let dotColor = 'bg-[#98948D] border-[#66625B]';
                if (isOpened || isClicked) dotColor = 'bg-[#C7A46A] border-[#7A5D33] ring-4 ring-amber-100';
                else if (isDelivered) dotColor = 'bg-[#2B6B48] border-emerald-700 ring-4 ring-emerald-100';
                else if (isFailed) dotColor = 'bg-[#9A3F2C] border-rose-700 ring-4 ring-rose-100';
                else if (isSent) dotColor = 'bg-[#847E75] border-[#524E48] ring-4 ring-stone-100';

                const eventDescription = evt.description || evt.details;

                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute -left-[19px] top-1 w-3 h-3 rounded-full border-2 transition-all ${dotColor}`}
                    />

                    <div className="bg-white p-3 rounded-lg border border-[#DED7CA] shadow-2xs hover:border-[#CDC4B3] transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-xs text-[#171717]">
                          {eventTitle}
                        </span>
                        <span className="text-[11px] text-[#66625B]">
                          {formatFullDateTime(evt.timestamp)}
                        </span>
                      </div>
                      {eventDescription && (
                        <p className="text-xs text-[#66625B] mt-1">{eventDescription}</p>
                      )}
                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#EEE8DC] text-[10px] font-mono text-[#66625B] bg-[#FBF9F5] p-1.5 rounded overflow-x-auto">
                          {JSON.stringify(evt.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
