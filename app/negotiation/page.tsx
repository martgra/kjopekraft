import NegotiationClientPage from '@/features/negotiation/components/NegotiationClientPage'
import { getInflationData } from '@/services/inflation'
import { connection } from 'next/server'
import { logger } from '@/lib/logger'

export default async function Page() {
  await connection()

  let inflationData: Awaited<ReturnType<typeof getInflationData>> = []

  try {
    inflationData = await getInflationData()
  } catch (error) {
    logger.error('Failed to fetch inflation data', error, { component: 'NegotiationPage' })
  }

  return <NegotiationClientPage inflationData={inflationData} />
}
