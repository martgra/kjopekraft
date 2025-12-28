import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-panel)] border border-[var(--border-light)] bg-[var(--surface-subtle)]',
          paddings[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Panel.displayName = 'Panel'
