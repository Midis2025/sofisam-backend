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
            'w-full appearance-none rounded-lg border border-[#DED7CA] bg-white px-3.5 py-2 pr-9 text-sm text-[#171717] transition-colors focus:border-[#C7A46A] focus:outline-none focus:ring-1 focus:ring-[#C7A46A] disabled:cursor-not-allowed disabled:bg-[#F6F2EA] disabled:opacity-60 cursor-pointer',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#66625B]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
