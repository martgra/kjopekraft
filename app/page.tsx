import { Suspense } from 'react'
import DashboardWithDrawer from '@/components/dashboard/DashboardWithDrawer'
import { getInflationData } from '@/services/inflation'
import { connection } from 'next/server'
import { DashboardSkeleton } from '@/components/ui/skeletons'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { logger } from '@/lib/logger'

/**
 * Async server component that fetches inflation data
 * Uses 'use cache' via the service layer for caching
 * Wrapped in Suspense for streaming/progressive loading
 */
async function DashboardWithData() {
  // Access connection first to opt into dynamic rendering
  // This is required before using Date or logger with timestamps
  await connection()

  const currentYear = new Date().getFullYear()
  let inflationData: Awaited<ReturnType<typeof getInflationData>> = []

  try {
    inflationData = await getInflationData()
  } catch (error) {
    logger.error('Failed to fetch inflation data', error, { component: 'DashboardWithData' })
    // Component will handle empty data gracefully
  }

  return <DashboardWithDrawer inflationData={inflationData} currentYear={currentYear} />
}

export default function Page() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardWithData />
      </Suspense>
    </ErrorBoundary>
  )
}
