'use client'

import { cn } from '@/lib/utils/cn'

export interface ToggleProps {
  checked: boolean
  onChange: () => void
  label?: string
  className?: string
  labelClassName?: string
  ariaLabel?: string
  dataTestId?: string
}

export function Toggle({
  checked,
  onChange,
  label,
  className,
  labelClassName,
  ariaLabel,
  dataTestId,
}: ToggleProps) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        onClick={onChange}
        data-testid={dataTestId}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out',
          'focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none',
          checked ? 'bg-[var(--primary)]' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
      {label && (
        <span
          className={cn('text-xs font-medium text-[var(--text-main)] md:text-sm', labelClassName)}
        >
          {label}
        </span>
      )}
    </label>
  )
}
