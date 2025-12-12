/**
 * Hook for fetching and managing reference salary data from SSB
 */

import useSWR from 'swr'
import type { ReferenceSalaryResponse, ReferenceDataPoint } from '../types'
import type { OccupationKey } from '../occupations'
import { DEFAULT_OCCUPATION, OCCUPATIONS } from '../occupations'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export type UseReferenceSalaryOptions = {
  occupation?: OccupationKey
  fromYear?: number
  enabled?: boolean // Allow conditional fetching
}

export function useReferenceSalary(options: UseReferenceSalaryOptions = {}) {
  const { occupation = DEFAULT_OCCUPATION, fromYear = 2015, enabled = true } = options

  // Map occupation key to SSB code
  const occupationCode = OCCUPATIONS[occupation].code

  const { data, error, isLoading } = useSWR<ReferenceSalaryResponse>(
    enabled ? `/api/ssb/salary?occupation=${occupationCode}&fromYear=${fromYear}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      // Cache for 24h on client side (API route has its own cache)
      dedupingInterval: 86400000,
    },
  )

  // Extract yearly series (pre-calculated by API)
  const yearlyData: ReferenceDataPoint[] = data?.derived?.yearlyNok ?? []

  return {
    data: yearlyData,
    isLoading,
    error: error as Error | null,
    metadata: data
      ? {
          occupation: data.occupation,
          unit: data.unit,
          source: data.source,
          filters: data.filters,
        }
      : null,
  }
}
