import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2"
          >
            {label}
          </label>
        )}
        {/* HibiList Design System - Clean, minimal input styling */}
        <input
          id={inputId}
          className={cn(
            'flex w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm placeholder-gray-400 transition-colors focus:outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-300 focus:border-red-400',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };