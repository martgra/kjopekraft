import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const gaps = {
  sm: 'gap-3',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-10',
}

export const PageShell = forwardRef<HTMLDivElement, PageShellProps>(
  ({ gap = 'md', className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex min-h-full flex-col', gaps[gap], className)} {...props}>
        {children}
      </div>
    )
  },
)

PageShell.displayName = 'PageShell'
