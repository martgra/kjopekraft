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
  success: 'bg-green-50 text-green-700',
  warning: 'bg-yellow-50 text-yellow-800',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  primary: 'bg-[var(--primary)]/10 text-[var(--primary)]',
}

const ringVariants = {
  default: 'ring-1 ring-inset ring-gray-600/10',
  success: 'ring-1 ring-inset ring-green-600/20',
  warning: 'ring-1 ring-inset ring-yellow-600/20',
  error: 'ring-1 ring-inset ring-red-600/20',
  info: 'ring-1 ring-inset ring-blue-700/10',
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
