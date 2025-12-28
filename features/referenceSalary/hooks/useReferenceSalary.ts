/**
 * Hook for fetching and managing reference salary data from SSB
 */

import useSWR from 'swr'
import { useEffect, useRef } from 'react'
import type {
  ReferenceSalaryResponse,
  ReferenceDataPoint,
  OccupationDefinition,
} from '@/domain/reference'
import { DEFAULT_OCCUPATION, OCCUPATIONS, type OccupationKey } from '../occupations'
import { fetchJson } from '@/lib/api/fetchJson'
import type { OccupationSelection } from '@/lib/ssb/occupationSelection'
import { useToast } from '@/contexts/toast/ToastContext'
import { TEXT } from '@/lib/constants/text'

const fetcher = (url: string) =>
  fetchJson<ReferenceSalaryResponse>(url, undefined, {
    errorPrefix: 'Reference salary request failed',
  })

type UseReferenceSalaryOptions = {
  occupation?: OccupationSelection | OccupationKey | null
  fromYear?: number
  enabled?: boolean // Allow conditional fetching
}

export function useReferenceSalary(options: UseReferenceSalaryOptions = {}) {
  const { occupation = DEFAULT_OCCUPATION, fromYear = 2015, enabled = true } = options
  const { showToast } = useToast()
  const lastAlertKeyRef = useRef<string | null>(null)

  const occupationDef: OccupationDefinition | OccupationSelection | null =
    occupation && typeof occupation === 'string'
      ? (OCCUPATIONS[occupation] as OccupationDefinition)
      : occupation

  const occupationCode = occupationDef?.code
  const occupationLabel =
    (occupationDef as OccupationSelection | undefined)?.label ??
    (occupationDef && 'label' in occupationDef ? occupationDef.label : undefined)
  const sector =
    (occupationDef as { sector?: string } | undefined)?.sector !== undefined
      ? (occupationDef as { sector?: string }).sector
      : undefined // Optional sector filter
  const provider = (occupationDef as OccupationSelection | undefined)?.provider ?? 'ssb'
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

  useEffect(() => {
    if (!data?.alerts?.length) return
    const fallbackAlert = data.alerts.find(alert => alert.code === 'fallback')
    if (!fallbackAlert) return
    const alertKey = `${fallbackAlert.source}-${fallbackAlert.cachedAt ?? 'unknown'}`
    if (lastAlertKeyRef.current === alertKey) return

    lastAlertKeyRef.current = alertKey
    showToast(
      fallbackAlert.source === 'Stortinget'
        ? TEXT.referenceSalary.stortingFallbackNotice
        : TEXT.referenceSalary.fallbackNotice,
      { variant: 'error' },
    )
  }, [data, showToast])

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
          alerts: data.alerts ?? [],
        }
      : null,
  }
}
