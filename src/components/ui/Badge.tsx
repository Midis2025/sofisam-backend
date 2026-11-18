import React from 'react';
import { cn } from '@/lib/utils';
import { EnquiryStatus, EnquiryPriority, FormType, SubscriberStatus } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'navy' | 'gold' | 'success' | 'warning' | 'info' | 'danger';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    navy: 'bg-[#14243A]/10 text-[#14243A] border-[#14243A]/20',
    gold: 'bg-[#B99A62]/15 text-[#8D703D] border-[#B99A62]/30',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
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
        <Badge variant="info" className="font-semibold bg-blue-50 text-blue-700 border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 animate-pulse" />
          New
        </Badge>
      );
    case 'contacted':
      return (
        <Badge variant="gold" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B99A62] mr-1.5" />
          Contacted
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="warning" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          In Progress
        </Badge>
      );
    case 'converted':
      return (
        <Badge variant="success" className="font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
          Converted
        </Badge>
      );
    case 'closed':
      return (
        <Badge variant="default" className="text-slate-500 border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
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
        <Badge variant="danger" className="font-semibold">
          High
        </Badge>
      );
    case 'normal':
      return (
        <Badge variant="default" className="text-slate-600">
          Normal
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="outline" className="text-slate-500">
          Low
        </Badge>
      );
  }
}

export function FormTypeBadge({ formType }: { formType: FormType }) {
  if (formType === 'private_enquiry') {
    return (
      <Badge variant="navy" className="font-semibold bg-[#14243A]/10 text-[#14243A] border-[#14243A]/25">
        Private Office
      </Badge>
    );
  }
  return (
    <Badge variant="gold" className="font-medium bg-[#B99A62]/10 text-[#836937] border-[#B99A62]/25">
      General Contact
    </Badge>
  );
}

export function SubscriberBadge({ status }: { status: SubscriberStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="success" className="font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="text-slate-400 border-slate-200">
      Unsubscribed
    </Badge>
  );
}
