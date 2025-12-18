'use client'

import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/atoms'
import { getRandomAIQuote } from '@/lib/constants/aiQuotes'

export interface AILoadingStateProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Custom class name */
  className?: string
  /** Custom spinner class name */
  spinnerClassName?: string
  /** Interval in milliseconds to rotate quotes (default: 3000) */
  quoteRotationInterval?: number
  /** Whether to show the quote (default: true) */
  showQuote?: boolean
}

/**
 * A reusable AI loading state component that displays a spinner with rotating quotes
 * Perfect for showing loading states during AI generation
 */
export function AILoadingState({
  size = 'sm',
  className = '',
  spinnerClassName = '',
  quoteRotationInterval = 3000,
  showQuote = true,
}: AILoadingStateProps) {
  const [quote, setQuote] = useState(() => getRandomAIQuote())

  useEffect(() => {
    if (!showQuote || quoteRotationInterval <= 0) return

    const interval = setInterval(() => {
      setQuote(getRandomAIQuote())
    }, quoteRotationInterval)

    return () => clearInterval(interval)
  }, [quoteRotationInterval, showQuote])

  return (
    <span className={`flex items-center gap-1.5 ${className}`}>
      <Spinner size={size} className={spinnerClassName} />
      {showQuote && <span>{quote}</span>}
    </span>
  )
}
