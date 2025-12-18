'use client'

import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/atoms'
import { getRandomAIQuote } from '@/lib/constants/aiQuotes'
import { cn } from '@/lib/utils/cn'

export interface AIStatusBadgeProps {
  /** Optional status label appended after the quote */
  label?: string
  /** How often quotes should rotate (ms) */
  quoteRotationInterval?: number
  /** Custom class name for the pill */
  className?: string
  /** Custom class name for the spinner */
  spinnerClassName?: string
  /** Size of the pill */
  size?: 'sm' | 'md'
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
}

/**
 * A pill-shaped AI loading badge that combines a spinner with rotating quotes.
 * Useful when you want a self-contained loading state without altering surrounding layout.
 */
export function AIStatusBadge({
  label,
  quoteRotationInterval = 3000,
  className,
  spinnerClassName,
  size = 'sm',
}: AIStatusBadgeProps) {
  const [quote, setQuote] = useState(() => getRandomAIQuote())

  useEffect(() => {
    if (quoteRotationInterval <= 0) return
    const interval = setInterval(() => setQuote(getRandomAIQuote()), quoteRotationInterval)
    return () => clearInterval(interval)
  }, [quoteRotationInterval])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex min-w-0 items-center rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/10 font-medium text-[var(--primary)]',
        'backdrop-blur-sm',
        sizeStyles[size],
        className,
      )}
    >
      <Spinner
        size="sm"
        className={cn('border-[var(--primary)] border-t-transparent', spinnerClassName)}
      />
      <span className="truncate italic">"{quote}"</span>
      {label && <span className="truncate">{label}</span>}
    </div>
  )
}
