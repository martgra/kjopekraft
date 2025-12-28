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

const MIN_QUERY_LENGTH = 2
const RESULTS_LIMIT = 8
const OCCUPATION_ENDPOINT = '/api/ssb/occupations'

export function OccupationSearchSelect({
  selectedOccupation,
  onOccupationChange,
  testIdBase,
  className,
  compact = false,
}: OccupationSearchSelectProps) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim()
  const loweredQuery = normalizedQuery.toLowerCase()
  const hasQuery = normalizedQuery.length >= MIN_QUERY_LENGTH
  const fuse = useMemo(() => createOccupationFuse(SSB_OCCUPATION_DOCS), [])
  const { showToast } = useToast()
  const hasShownCreditsToast = useRef(false)

  const queryKey = hasQuery
    ? `${OCCUPATION_ENDPOINT}?q=${encodeURIComponent(normalizedQuery)}`
    : null

  const { data, isLoading } = useSWR(
    queryKey,
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
      fallbackData: hasQuery
        ? {
            results: searchSsbOccupations(fuse, normalizedQuery, RESULTS_LIMIT).map(r => ({
              code: r.code,
              label: r.label,
            })),
          }
        : undefined,
    },
  )

  const presetMatches: OccupationSelection[] = useMemo(() => {
    if (!hasQuery) return []

    return (Object.keys(OCCUPATIONS) as OccupationKey[])
      .filter(key => {
        const preset = OCCUPATIONS[key]
        return 'provider' in preset && preset.provider === 'stortinget'
      })
      .map(key => presetOccupationToSelection(key))
      .filter(selection => {
        const haystack = `${selection.code} ${selection.label ?? ''}`.toLowerCase()
        return haystack.includes(loweredQuery)
      })
  }, [hasQuery, loweredQuery])

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
      const dedupeKey = `${item.provider ?? 'ssb'}-${item.code}`
      if (seen.has(dedupeKey)) return false
      seen.add(dedupeKey)
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

        {hasQuery && (
          <div
            className="max-h-56 overflow-auto rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm"
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
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--surface-subtle)]"
                data-testid={testId(`result-${result.code}`)}
              >
                <span className="font-medium text-[var(--text-main)]">{result.label}</span>
              </button>
            ))}
          </div>
        )}

        {selectedOccupation && (
          <div
            className="flex items-center justify-between rounded-lg bg-[var(--surface-light)] px-3 py-2 text-sm text-[var(--text-main)] shadow-sm"
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
