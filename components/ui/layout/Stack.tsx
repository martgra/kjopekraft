import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg' | 'xl'
}

const gaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ gap = 'md', className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col', gaps[gap], className)} {...props}>
        {children}
      </div>
    )
  },
)

Stack.displayName = 'Stack'
