import { Suspense } from 'react'
import { connection } from 'next/server'
import NegotiationClientPage from '@/features/negotiation/components/NegotiationClientPage'
import { getInflationData } from '@/services/inflation'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { logger } from '@/lib/logger'
import Loading from './loading'

async function NegotiationWithData() {
  await connection()

  let inflationData: Awaited<ReturnType<typeof getInflationData>> = []
  try {
    inflationData = await getInflationData()
  } catch (error) {
    logger.error('Failed to fetch inflation data', error, { component: 'NegotiationWithData' })
    // Component will handle empty data gracefully
  }

  return <NegotiationClientPage inflationData={inflationData} />
}

export default function Page() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <NegotiationWithData />
      </Suspense>
    </ErrorBoundary>
  )
}
