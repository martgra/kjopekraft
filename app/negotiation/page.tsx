import { Suspense } from 'react'
import NegotiationPage from '@/features/negotiation/components/NegotiationPage'
import { Spinner } from '@/components/ui/atoms'
import { getInflationData } from '@/lib/models/getInflationData'
import { connection } from 'next/server'

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

async function NegotiationPageWithData() {
  let inflationData: Awaited<ReturnType<typeof getInflationData>> = []

  try {
    inflationData = await getInflationData()
  } catch (error) {
    console.error('Failed to fetch inflation data:', error)
  }

  // Access connection to opt into dynamic rendering (required for Date access)
  await connection()

  // Pass current year from server
  const currentYear = new Date().getFullYear()

  return <NegotiationPage inflationData={inflationData} currentYear={currentYear} />
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NegotiationPageWithData />
    </Suspense>
  )
}
