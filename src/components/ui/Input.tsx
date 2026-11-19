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
          <div className="absolute left-3.5 text-[#66625B] pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-[#DED7CA] bg-white px-3.5 py-2 text-sm text-[#171717] placeholder-[#66625B] transition-colors focus:border-[#C7A46A] focus:outline-none focus:ring-1 focus:ring-[#C7A46A] disabled:cursor-not-allowed disabled:bg-[#F6F2EA] disabled:opacity-60',
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
