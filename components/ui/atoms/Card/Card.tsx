import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
}

const variants = {
  default: 'bg-[var(--surface-light)] border border-[var(--border-light)] shadow-sm',
  elevated: 'bg-[var(--surface-light)] shadow-md',
  outlined: 'bg-transparent border border-[var(--border-light)]',
  flat: 'bg-[var(--surface-light)]',
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', interactive, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl',
          variants[variant],
          paddings[padding],
          interactive && 'transition-shadow duration-150 hover:shadow-lg cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card subcomponents for better composition
export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-start justify-between', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-medium text-[var(--text-muted)]', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-3', className)} {...props}>
      {children}
    </div>
  )
}
