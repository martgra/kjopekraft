import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[var(--text-muted)]">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-md border border-[var(--border-light)] bg-gray-50',
              'px-3 py-1.5 text-base text-[var(--text-main)]',
              'placeholder:text-gray-400',
              'focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none',
              'transition-colors duration-150',
              'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              suffix && 'pr-12',
              className,
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
