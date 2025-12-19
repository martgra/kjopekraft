'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { mapJobTitleToOccupation } from '@/lib/ssb/occupationMapper'

type SalarySeriesPoint = {
  year: number
  value: number | null
  type?: 'official' | 'estimated'
}

type SalarySeriesResponse = {
  occupation?: { code: string; label?: string }
  derived?: { yearlyNok?: SalarySeriesPoint[] }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`SSB request failed (${res.status}): ${text}`)
  }
  return res.json()
}

type OccupationOverride = { code: string; label?: string }

export function useSsbMedianSalary(
  jobTitle: string,
  occupationOverride?: OccupationOverride | null,
) {
  const occupationMatch = useMemo(() => mapJobTitleToOccupation(jobTitle), [jobTitle])
  const selectedOccupation = occupationOverride ?? occupationMatch
  const apiUrl = selectedOccupation
    ? `/api/ssb/salary?occupation=${selectedOccupation.code}&stat=01&fromYear=2015`
    : null

  const { data, error, isLoading } = useSWR<SalarySeriesResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
    dedupingInterval: 86400000,
  })

  const latest = useMemo(() => {
    const series = data?.derived?.yearlyNok ?? []
    return series.reduce<SalarySeriesPoint | null>((acc, point) => {
      if (point.value == null) return acc
      if (!acc || point.year > acc.year) return point
      return acc
    }, null)
  }, [data])

  return {
    occupationMatch: selectedOccupation
      ? {
          code: selectedOccupation.code,
          label: selectedOccupation.label,
          isApproximate: occupationOverride ? false : (occupationMatch?.isApproximate ?? false),
        }
      : null,
    medianSalary: latest?.value ?? null,
    medianYear: latest?.year ?? null,
    isLoading,
    error: error as Error | null,
  }
}
