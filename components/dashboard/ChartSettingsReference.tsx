'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { Input } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import {
  type ReferenceOccupationSelection,
  presetOccupationToSelection,
} from '@/features/referenceSalary/occupations'
import { createTestId } from '@/lib/testing/testIds'
import {
  SSB_OCCUPATION_DOCS,
  createOccupationFuse,
  searchSsbOccupations,
} from '@/lib/ssb/occupationSearch'

interface ChartSettingsReferenceProps {
  selectedOccupation: ReferenceOccupationSelection | null
  onOccupationChange: (value: ReferenceOccupationSelection | null) => void
}

export function ChartSettingsReference({
  selectedOccupation,
  onOccupationChange,
}: ChartSettingsReferenceProps) {
  const [query, setQuery] = useState('')
  const fuse = useMemo(() => createOccupationFuse(SSB_OCCUPATION_DOCS), [])

  const { data, isLoading } = useSWR(
    query ? `/api/ssb/occupations?q=${encodeURIComponent(query)}` : null,
    async url => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to search occupations')
      return res.json() as Promise<{ results: Array<{ code: string; label: string }> }>
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

  const results = data?.results ?? []

  const testId = createTestId('chart-settings-reference')

  const handleSelect = (selection: ReferenceOccupationSelection) => {
    onOccupationChange(selection)
    setQuery('')
  }

  const quickPicks = useMemo(
    () => [
      presetOccupationToSelection('nurses'),
      presetOccupationToSelection('teachers'),
      presetOccupationToSelection('managersState'),
      presetOccupationToSelection('stortingsrepresentant'),
    ],
    [],
  )

  return (
    <div
      className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
      data-testid={testId('container')}
    >
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
          className="text-sm"
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
                key={result.code}
                type="button"
                onClick={() =>
                  handleSelect({
                    code: result.code,
                    label: result.label,
                    provider: 'ssb',
                  })
                }
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                data-testid={testId(`result-${result.code}`)}
              >
                <span className="font-medium text-[var(--text-main)]">{result.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2" data-testid={testId('quick-picks')}>
          {quickPicks.map(pick => (
            <button
              key={pick.code + pick.presetKey}
              type="button"
              onClick={() => handleSelect(pick)}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--text-main)] shadow-sm transition hover:bg-[var(--color-gray-50)] dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {pick.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onOccupationChange(null)}
            className="rounded-full border border-[var(--border-light)] bg-white px-3 py-1 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--color-gray-50)] dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
            data-testid={testId('clear')}
          >
            {TEXT.charts.noReference}
          </button>
        </div>

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
