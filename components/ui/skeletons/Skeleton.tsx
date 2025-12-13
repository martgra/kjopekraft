import { CSSProperties } from 'react'
import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

/**
 * Base skeleton component for loading states
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      style={style}
      role="status"
      aria-label="Loading"
    />
  )
}

// Fixed heights for chart bars to avoid Math.random() in server components
const CHART_BAR_HEIGHTS = [
  'h-[60%]',
  'h-[75%]',
  'h-[50%]',
  'h-[85%]',
  'h-[65%]',
  'h-[70%]',
  'h-[55%]',
  'h-[80%]',
]

/**
 * Skeleton for chart loading state
 */
export function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-4 p-4', className)}>
      <Skeleton className="h-6 w-1/3" />
      <div className="flex h-64 items-end gap-2">
        {CHART_BAR_HEIGHTS.map((height, i) => (
          <Skeleton key={i} className={cn('flex-1', height)} />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-8" />
        ))}
      </div>
    </div>
  )
}

/**
 * Skeleton for metric cards
 */
export function MetricSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-xl bg-white p-4 shadow-sm', className)}>
      <Skeleton className="mb-2 h-4 w-1/2" />
      <Skeleton className="mb-1 h-8 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

/**
 * Skeleton for metric grid (3 cards)
 */
export function MetricGridSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3', className)}>
      <MetricSkeleton />
      <MetricSkeleton />
      <MetricSkeleton />
    </div>
  )
}

/**
 * Skeleton for table rows
 */
export function TableRowSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 py-3', className)}>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

/**
 * Skeleton for table
 */
export function TableSkeleton({ rows = 5, className }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn('space-y-2 p-4', className)}>
      <div className="flex items-center gap-4 border-b pb-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Full dashboard skeleton for initial page load
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--background-light)] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="mb-2 h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Metrics */}
      <MetricGridSkeleton className="mb-6" />

      {/* Chart */}
      <div className="mb-6 rounded-xl bg-white shadow-sm">
        <ChartSkeleton />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm">
        <TableSkeleton rows={4} />
      </div>
    </div>
  )
}
