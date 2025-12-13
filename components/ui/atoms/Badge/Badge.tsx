import { cn } from '@/lib/utils/cn'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary'
  size?: 'sm' | 'md'
  withRing?: boolean
  className?: string
}

const variants = {
  default: 'bg-gray-50 text-gray-700',
  success: 'bg-[var(--color-green-100)] text-[var(--primary)]',
  warning: 'bg-[var(--color-yellow-100)] text-yellow-800',
  error: 'bg-red-50 text-red-700',
  info: 'bg-[var(--color-blue-100)] text-[var(--secondary)]',
  primary: 'bg-[var(--primary)]/10 text-[var(--primary)]',
}

const ringVariants = {
  default: 'ring-1 ring-inset ring-gray-600/10',
  success: 'ring-1 ring-inset ring-[var(--primary)]/20',
  warning: 'ring-1 ring-inset ring-[var(--accent)]/20',
  error: 'ring-1 ring-inset ring-red-600/20',
  info: 'ring-1 ring-inset ring-[var(--secondary)]/20',
  primary: 'ring-1 ring-inset ring-[var(--primary)]/20',
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
