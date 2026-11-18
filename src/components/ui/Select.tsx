import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-lg border border-[#E5E9EF] bg-white px-3.5 py-2 pr-9 text-sm text-[#182536] transition-colors focus:border-[#B99A62] focus:outline-none focus:ring-1 focus:ring-[#B99A62] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 cursor-pointer',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7C8795]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
