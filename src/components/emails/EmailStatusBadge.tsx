import React from 'react';
import { EmailDeliveryStatusType } from '@/types';

interface EmailStatusBadgeProps {
  status: EmailDeliveryStatusType;
}

export function EmailStatusBadge({ status }: EmailStatusBadgeProps) {
  switch (status) {
    case 'delivered':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#2B6B48] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2B6B48] mr-1.5" />
          Delivered
        </span>
      );

    case 'sent':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C7A46A]/15 text-[#7A5D33] border border-[#C7A46A]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7A46A] mr-1.5" />
          Sent
        </span>
      );

    case 'queued':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F6F2EA] text-[#66625B] border border-[#DED7CA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#98948D] mr-1.5" />
          Queued
        </span>
      );

    case 'delivery_delayed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-[#C07D2B] border border-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C07D2B] mr-1.5 animate-pulse" />
          Delivery Delayed
        </span>
      );

    case 'bounced':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-[#9A3F2C] border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9A3F2C] mr-1.5" />
          Bounced
        </span>
      );

    case 'complained':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-[#9A3F2C] border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9A3F2C] mr-1.5" />
          Spam Complaint
        </span>
      );

    case 'failed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-[#9A3F2C] border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9A3F2C] mr-1.5" />
          Failed
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F6F2EA] text-[#66625B] border border-[#DED7CA]">
          {status}
        </span>
      );
  }
}
