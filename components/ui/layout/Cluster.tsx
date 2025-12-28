import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface ClusterProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
  wrap?: boolean
}

const gaps = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
}

const aligns = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifies = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

export const Cluster = forwardRef<HTMLDivElement, ClusterProps>(
  (
    { gap = 'md', align = 'center', justify = 'start', wrap = true, className, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          gaps[gap],
          aligns[align],
          justifies[justify],
          wrap ? 'flex-wrap' : 'flex-nowrap',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Cluster.displayName = 'Cluster'
