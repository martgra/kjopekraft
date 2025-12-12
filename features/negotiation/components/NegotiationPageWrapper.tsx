'use client'

import { useEffect, useState } from 'react'
import NegotiationPage from './NegotiationPage'
import { Spinner } from '@/components/ui/atoms'
import type { InflationDataPoint } from '@/lib/models/inflation'

/**
 * Client-side wrapper that fetches inflation data and passes it to NegotiationPage
 * This component is dynamically imported with ssr: false to prevent hydration issues
 */
export default function NegotiationPageWrapper() {
  const [inflationData, setInflationData] = useState<InflationDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/inflation')
        if (!response.ok) {
          throw new Error('Failed to fetch inflation data')
        }
        const data = await response.json()
        setInflationData(data)
      } catch (err) {
        console.error('Failed to fetch inflation data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background-light)]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-[var(--text-muted)]">Laster...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background-light)]">
        <div className="text-center">
          <p className="text-red-500">Kunne ikke laste data: {error}</p>
        </div>
      </div>
    )
  }

  const currentYear = new Date().getFullYear()

  return <NegotiationPage inflationData={inflationData} currentYear={currentYear} />
}
