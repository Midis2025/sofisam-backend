import React from 'react';
import { EmailType } from '@/types';

interface EmailTypeBadgeProps {
  type: EmailType;
}

export function EmailTypeBadge({ type }: EmailTypeBadgeProps) {
  switch (type) {
    case 'admin_notification':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#171717]/8 text-[#171717] border border-[#171717]/20">
          Admin Alert
        </span>
      );

    case 'customer_acknowledgement':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#C7A46A]/15 text-[#7A5D33] border border-[#C7A46A]/30">
          Client Ack
        </span>
      );

    case 'newsletter_welcome':
    case 'newsletter_confirmation':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#2B6B48] border border-emerald-200">
          Newsletter
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F6F2EA] text-[#66625B] border border-[#DED7CA]">
          System
        </span>
      );
  }
}
