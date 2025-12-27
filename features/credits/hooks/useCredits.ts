'use client'

import useSWR from 'swr'
import { fetchJson } from '@/lib/api/fetchJson'

type Credits = {
  used: number
  limit: number
  remaining: number
}

type CreditsResponse = {
  credits: Credits
}

type UseCreditsOptions = {
  enabled?: boolean
  refreshInterval?: number
}

export function useCredits(options: UseCreditsOptions = {}) {
  const { enabled = true, refreshInterval = 15000 } = options
  const { data, error, isLoading } = useSWR<CreditsResponse>(
    enabled ? '/api/credits' : null,
    url => fetchJson<CreditsResponse>(url),
    { revalidateOnFocus: false, refreshInterval },
  )

  const label = data ? `${data.credits.remaining}/${data.credits.limit}` : '—'

  return {
    credits: data?.credits ?? null,
    label,
    isLoading,
    error: error as Error | null,
  }
}
