import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    // HibiList Design System - Ultra-minimalist button styles with touch support
    const baseClasses = 'inline-flex items-center justify-center rounded-2xl font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 touch-manipulation';
    
    const variants = {
      primary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 active:scale-95',
      secondary: 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300',
      outline: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
      ghost: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200',
      danger: 'text-red-600 hover:bg-red-50 active:bg-red-100',
    };

    const sizes = {
      sm: 'px-4 py-3 text-sm min-h-[44px]', // Ensure 44px minimum for touch
      md: 'px-6 py-3 text-sm min-h-[44px]', // Ensure 44px minimum for touch
      lg: 'px-6 py-4 text-base min-h-[44px]', // Already large enough
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };