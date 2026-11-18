import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm select-none';

    const variantStyles = {
      primary: 'bg-[#14243A] text-white hover:bg-[#1C3250] focus:ring-[#14243A] shadow-sm',
      gold: 'bg-[#B99A62] text-white hover:bg-[#A6874E] focus:ring-[#B99A62] shadow-sm',
      secondary: 'bg-[#E5E9EF] text-[#182536] hover:bg-[#D5DDE6] focus:ring-slate-300',
      outline: 'border border-[#E5E9EF] bg-white text-[#182536] hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200',
      danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
    };

    const sizeStyles = {
      sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
      md: 'px-4 py-2 text-sm rounded-lg gap-2',
      lg: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
