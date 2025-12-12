import { Suspense } from 'react'
import DashboardWithDrawer from '@/components/dashboard/DashboardWithDrawer'
import { getInflationData } from '@/lib/models/getInflationData'
import { connection } from 'next/server'
import { Spinner } from '@/components/ui/atoms'

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--background-light)]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-[var(--text-muted)]">Laster...</p>
      </div>
    </div>
  )
}

async function DashboardWithData() {
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

  return <DashboardWithDrawer inflationData={inflationData} currentYear={currentYear} />
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardWithData />
    </Suspense>
  )
}
