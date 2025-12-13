/**
 * Hook for fetching and managing reference salary data from SSB
 */

import useSWR from 'swr'
import type { ReferenceSalaryResponse, ReferenceDataPoint, OccupationDefinition } from '../types'
import type { OccupationKey } from '../occupations'
import { DEFAULT_OCCUPATION, OCCUPATIONS } from '../occupations'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Reference salary request failed (${res.status}): ${text}`)
  }
  return res.json()
}

export type UseReferenceSalaryOptions = {
  occupation?: OccupationKey
  fromYear?: number
  enabled?: boolean // Allow conditional fetching
}

export function useReferenceSalary(options: UseReferenceSalaryOptions = {}) {
  const { occupation = DEFAULT_OCCUPATION, fromYear = 2015, enabled = true } = options

  // Map occupation key to provider-specific configuration
  const occupationDef: OccupationDefinition = OCCUPATIONS[occupation] as OccupationDefinition
  const occupationCode = occupationDef.code
  const sector = 'sector' in occupationDef ? occupationDef.sector : undefined // Optional sector filter
  const provider = occupationDef.provider ?? 'ssb'
  const effectiveFromYear =
    occupationDef.availableFromYear && occupationDef.availableFromYear > fromYear
      ? occupationDef.availableFromYear
      : fromYear

  // Build API URL per provider
  const apiUrl = enabled
    ? provider === 'stortinget'
      ? `/api/reference/storting?fromYear=${effectiveFromYear}`
      : `/api/ssb/salary?occupation=${occupationCode}&fromYear=${effectiveFromYear}${sector ? `&sector=${sector}` : ''}`
    : null

  const { data, error, isLoading } = useSWR<ReferenceSalaryResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    // Cache for 24h on client side (API route has its own cache)
    dedupingInterval: 86400000,
  })

  // Extract yearly series (pre-calculated by API or already annual)
  let yearlyData: ReferenceDataPoint[] = []
  if (data) {
    yearlyData = data.unit === 'NOK/year' ? data.series : (data.derived?.yearlyNok ?? [])
  }

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
