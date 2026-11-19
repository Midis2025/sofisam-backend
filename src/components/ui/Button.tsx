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
      primary: 'bg-[#171717] text-white hover:bg-[#2C2A26] focus:ring-[#171717] shadow-sm',
      gold: 'bg-[#C7A46A] text-[#0B0B0D] hover:bg-[#B89355] focus:ring-[#C7A46A] shadow-sm font-semibold',
      secondary: 'bg-[#EEE8DC] text-[#171717] hover:bg-[#E5DEC8] focus:ring-[#CDC4B3]',
      outline: 'border border-[#DED7CA] bg-white text-[#171717] hover:bg-[#FBF9F5] hover:border-[#CDC4B3] focus:ring-[#DED7CA]',
      ghost: 'bg-transparent text-[#66625B] hover:bg-[#F6F2EA] hover:text-[#171717] focus:ring-[#DED7CA]',
      danger: 'bg-[#9A3F2C] text-white hover:bg-[#853523] focus:ring-[#9A3F2C] shadow-sm',
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
