import React from 'react';
import { cn } from '@/lib/utils';
import { EnquiryStatus, EnquiryPriority, FormType, SubscriberStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'navy' | 'gold' | 'success' | 'warning' | 'info' | 'danger';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#F6F2EA] text-[#66625B] border-[#DED7CA]',
    outline: 'bg-transparent text-[#66625B] border-[#DED7CA]',
    navy: 'bg-[#171717]/8 text-[#171717] border-[#171717]/20',
    gold: 'bg-[#C7A46A]/15 text-[#7A5D33] border-[#C7A46A]/30',
    success: 'bg-emerald-50 text-[#2B6B48] border-emerald-200',
    warning: 'bg-amber-50 text-[#C07D2B] border-amber-200',
    info: 'bg-[#F4EFE6] text-[#625F59] border-[#DED7CA]',
    danger: 'bg-rose-50 text-[#9A3F2C] border-rose-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  switch (status) {
    case 'new':
      return (
        <Badge variant="gold" className="font-semibold bg-[#C7A46A]/15 text-[#7A5D33] border-[#C7A46A]/35">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C7A46A] mr-1.5 animate-pulse" />
          New
        </Badge>
      );
    case 'contacted':
      return (
        <Badge variant="gold" className="font-semibold bg-[#7A5D33]/12 text-[#7A5D33] border-[#7A5D33]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A5D33] mr-1.5" />
          Contacted
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="warning" className="font-semibold bg-amber-50 text-[#C07D2B] border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C07D2B] mr-1.5" />
          In Progress
        </Badge>
      );
    case 'converted':
      return (
        <Badge variant="success" className="font-semibold bg-emerald-50 text-[#2B6B48] border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2B6B48] mr-1.5" />
          Converted
        </Badge>
      );
    case 'closed':
      return (
        <Badge variant="default" className="text-[#66625B] border-[#DED7CA] bg-[#F6F2EA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#98948D] mr-1.5" />
          Closed
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

export function PriorityBadge({ priority }: { priority: EnquiryPriority }) {
  switch (priority) {
    case 'high':
      return (
        <Badge variant="danger" className="font-semibold bg-rose-50 text-[#9A3F2C] border-rose-200">
          High
        </Badge>
      );
    case 'normal':
      return (
        <Badge variant="default" className="text-[#66625B] border-[#DED7CA] bg-[#F6F2EA]">
          Normal
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="outline" className="text-[#98948D] border-[#DED7CA]">
          Low
        </Badge>
      );
  }
}

export function FormTypeBadge({ formType }: { formType: FormType }) {
  if (formType === 'private_enquiry') {
    return (
      <Badge variant="navy" className="font-semibold bg-[#171717]/8 text-[#171717] border-[#171717]/20">
        Private Office
      </Badge>
    );
  }
  return (
    <Badge variant="gold" className="font-medium bg-[#C7A46A]/15 text-[#7A5D33] border-[#C7A46A]/30">
      General Contact
    </Badge>
  );
}

export function SubscriberBadge({ status }: { status: SubscriberStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="success" className="font-semibold bg-emerald-50 text-[#2B6B48] border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2B6B48] mr-1.5" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="text-[#98948D] border-[#DED7CA] bg-[#F6F2EA]">
      Unsubscribed
    </Badge>
  );
}
