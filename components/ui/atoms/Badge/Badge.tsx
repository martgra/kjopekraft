import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
  size?: 'sm' | 'md'
  withRing?: boolean
  className?: string
}

const variants = {
  default: 'bg-[var(--badge-default-bg)] text-[var(--badge-default-text)]',
  success: 'bg-[var(--badge-success-bg)] text-[var(--badge-success-text)]',
  warning: 'bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)]',
  error: 'bg-[var(--badge-error-bg)] text-[var(--badge-error-text)]',
  info: 'bg-[var(--badge-info-bg)] text-[var(--badge-info-text)]',
  primary: 'bg-[var(--badge-primary-bg)] text-[var(--badge-primary-text)]',
}

const ringVariants = {
  default: 'ring-1 ring-inset ring-[var(--badge-default-ring)]',
  success: 'ring-1 ring-inset ring-[var(--badge-success-ring)]',
  warning: 'ring-1 ring-inset ring-[var(--badge-warning-ring)]',
  error: 'ring-1 ring-inset ring-[var(--badge-error-ring)]',
  info: 'ring-1 ring-inset ring-[var(--badge-info-ring)]',
  primary: 'ring-1 ring-inset ring-[var(--badge-primary-ring)]',
}

const sizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  withRing = true,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium tracking-tight',
        variants[variant],
        withRing && ringVariants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </span>
  )
}
