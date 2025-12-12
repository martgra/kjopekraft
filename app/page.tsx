import Dashboard from '@/components/dashboard/Dashboard'
import { getInflationData } from '@/lib/models/getInflationData'
import { connection } from 'next/server'

export default async function Page() {
  let inflationData: Awaited<ReturnType<typeof getInflationData>> = []

  try {
    inflationData = await getInflationData()
  } catch (error) {
    console.error('Failed to fetch inflation data:', error)
    // Component will handle empty data gracefully
  }

  // Access connection to opt into dynamic rendering (required for Date access)
  await connection()

  // Pass current year from server to avoid runtime date access in client
  const currentYear = new Date().getFullYear()

  return <Dashboard inflationData={inflationData} currentYear={currentYear} />
}
