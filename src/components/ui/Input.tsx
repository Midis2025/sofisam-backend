import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-[#7C8795] pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-[#E5E9EF] bg-white px-3.5 py-2 text-sm text-[#182536] placeholder-[#7C8795] transition-colors focus:border-[#B99A62] focus:outline-none focus:ring-1 focus:ring-[#B99A62] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
            icon ? 'pl-10' : '',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
