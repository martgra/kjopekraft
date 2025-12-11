import Dashboard from '@/components/dashboard/Dashboard'
import { getInflationData } from '@/lib/models/getInflationData'

// Force dynamic rendering for API data
export const dynamic = 'force-dynamic'

export default async function Page() {
  let inflationData: Awaited<ReturnType<typeof getInflationData>> = []

  try {
    inflationData = await getInflationData()
  } catch (error) {
    console.error('Failed to fetch inflation data:', error)
    // Component will handle empty data gracefully
  }

  return <Dashboard inflationData={inflationData} />
}
