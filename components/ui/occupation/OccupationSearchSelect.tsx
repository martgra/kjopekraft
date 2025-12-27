'use client'

import { useMemo, useRef, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Input } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'
import {
  SSB_OCCUPATION_DOCS,
  createOccupationFuse,
  searchSsbOccupations,
} from '@/lib/ssb/occupationSearch'
import {
  OCCUPATIONS,
  type OccupationKey,
  presetOccupationToSelection,
} from '@/features/referenceSalary/occupations'
import { useToast } from '@/contexts/toast/ToastContext'
import { fetchJson } from '@/lib/api/fetchJson'
import type { OccupationSelection } from '@/lib/ssb/occupationSelection'

interface OccupationSearchSelectProps {
  selectedOccupation: OccupationSelection | null
  onOccupationChange: (value: OccupationSelection | null) => void
  testIdBase: string
  className?: string
  compact?: boolean
}

export function OccupationSearchSelect({
  selectedOccupation,
  onOccupationChange,
  testIdBase,
  className,
  compact = false,
}: OccupationSearchSelectProps) {
  const [query, setQuery] = useState('')
  const fuse = useMemo(() => createOccupationFuse(SSB_OCCUPATION_DOCS), [])
  const { showToast } = useToast()
  const hasShownCreditsToast = useRef(false)

  const { data, isLoading } = useSWR(
    query ? `/api/ssb/occupations?q=${encodeURIComponent(query)}` : null,
    async url => {
      const payload = await fetchJson<{
        results: Array<{ code: string; label: string }>
        creditsExhausted?: boolean
        spentCredits?: boolean
      }>(url, undefined, { errorPrefix: 'Failed to search occupations' })
      if (payload.creditsExhausted && !hasShownCreditsToast.current) {
        hasShownCreditsToast.current = true
        showToast(TEXT.credits.exhausted, { variant: 'error' })
      }
      if (payload.spentCredits) {
        mutate('/api/credits')
      }
      return payload
    },
    {
      revalidateOnFocus: false,
      fallbackData:
        query && query.length >= 2
          ? {
              results: searchSsbOccupations(fuse, query, 8).map(r => ({
                code: r.code,
                label: r.label,
              })),
            }
          : undefined,
    },
  )

  const presetMatches: OccupationSelection[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    return (Object.keys(OCCUPATIONS) as OccupationKey[])
      .filter(key => {
        const preset = OCCUPATIONS[key]
        return 'provider' in preset && preset.provider === 'stortinget'
      })
      .map(key => presetOccupationToSelection(key))
      .filter(selection => {
        const haystack = `${selection.code} ${selection.label ?? ''}`.toLowerCase()
        return haystack.includes(q)
      })
  }, [query])

  const results: OccupationSelection[] = useMemo(() => {
    const apiResults =
      data?.results?.map(result => ({
        code: result.code,
        label: result.label,
        provider: 'ssb' as const,
      })) ?? []

    const merged = [...presetMatches, ...apiResults]
    const seen = new Set<string>()
    return merged.filter(item => {
      const key = `${item.provider ?? 'ssb'}-${item.code}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [data?.results, presetMatches])

  const testId = createTestId(testIdBase)
  const inputClassName = compact ? 'text-sm' : ''

  const handleSelect = (selection: OccupationSelection) => {
    onOccupationChange(selection)
    setQuery('')
  }

  return (
    <div className={className} data-testid={testId('container')}>
      <label className="mb-2 block text-sm font-semibold text-[var(--text-main)]">
        {TEXT.settings.occupationLabel}
      </label>

      <div className="space-y-2">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={TEXT.settings.occupationSearchPlaceholder}
          aria-label={TEXT.settings.occupationLabel}
          data-testid={testId('search')}
          className={inputClassName}
        />

        {query && (
          <div
            className="max-h-56 overflow-auto rounded-lg border border-[var(--border-light)] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:shadow-none"
            data-testid={testId('results')}
          >
            {isLoading && (
              <div className="px-3 py-2 text-sm text-[var(--text-muted)]">
                {TEXT.common.loading}
              </div>
            )}
            {!isLoading && results.length === 0 && (
              <div className="px-3 py-2 text-sm text-[var(--text-muted)]">
                {TEXT.settings.occupationNoResults}
              </div>
            )}
            {results.map(result => (
              <button
                key={`${result.provider ?? 'ssb'}-${result.code}`}
                type="button"
                onClick={() => handleSelect(result)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                data-testid={testId(`result-${result.code}`)}
              >
                <span className="font-medium text-[var(--text-main)]">{result.label}</span>
              </button>
            ))}
          </div>
        )}

        {selectedOccupation && (
          <div
            className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-[var(--text-main)] shadow-sm dark:bg-gray-800"
            data-testid={testId('selected')}
          >
            <div className="flex flex-col">
              <span className="font-semibold">
                {selectedOccupation.label ?? TEXT.settings.selectedOccupationFallback}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {selectedOccupation.provider?.toUpperCase() ?? 'SSB'} · {selectedOccupation.code}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOccupationChange(null)}
              className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              {TEXT.settings.clearSelection}
            </button>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
        {TEXT.settings.occupationHelp}
      </p>
    </div>
  )
}
