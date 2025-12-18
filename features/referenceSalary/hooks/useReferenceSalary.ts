/**
 * Hook for fetching and managing reference salary data from SSB
 */

import useSWR from 'swr'
import type { ReferenceSalaryResponse, ReferenceDataPoint, OccupationDefinition } from '../types'
import {
  DEFAULT_OCCUPATION,
  OCCUPATIONS,
  type OccupationKey,
  type ReferenceOccupationSelection,
} from '../occupations'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Reference salary request failed (${res.status}): ${text}`)
  }
  return res.json()
}

export type UseReferenceSalaryOptions = {
  occupation?: ReferenceOccupationSelection | OccupationKey | null
  fromYear?: number
  enabled?: boolean // Allow conditional fetching
}

export function useReferenceSalary(options: UseReferenceSalaryOptions = {}) {
  const { occupation = DEFAULT_OCCUPATION, fromYear = 2015, enabled = true } = options

  const occupationDef: OccupationDefinition | ReferenceOccupationSelection | null =
    occupation && typeof occupation === 'string'
      ? (OCCUPATIONS[occupation] as OccupationDefinition)
      : occupation

  const occupationCode = occupationDef?.code
  const occupationLabel =
    (occupationDef as ReferenceOccupationSelection | undefined)?.label ??
    (occupationDef && 'label' in occupationDef ? occupationDef.label : undefined)
  const sector =
    (occupationDef as { sector?: string } | undefined)?.sector !== undefined
      ? (occupationDef as { sector?: string }).sector
      : undefined // Optional sector filter
  const provider = (occupationDef as ReferenceOccupationSelection | undefined)?.provider ?? 'ssb'
  const effectiveFromYear =
    occupationDef && 'availableFromYear' in occupationDef && occupationDef.availableFromYear
      ? occupationDef.availableFromYear > fromYear
        ? occupationDef.availableFromYear
        : fromYear
      : fromYear

  // Build API URL per provider
  const apiUrl =
    enabled && occupationCode
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
          occupation: { ...data.occupation, label: occupationLabel ?? data.occupation.label },
          unit: data.unit,
          source: data.source,
          filters: data.filters,
        }
      : null,
  }
}
