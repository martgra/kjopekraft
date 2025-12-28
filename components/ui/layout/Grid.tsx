import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
}

const columnsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

const gaps = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 2, gap = 'md', className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('grid', columnsMap[columns], gaps[gap], className)} {...props}>
        {children}
      </div>
    )
  },
)

Grid.displayName = 'Grid'
