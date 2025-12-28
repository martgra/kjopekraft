import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import type { ReferenceDataPoint, ReferenceSalaryResponse } from '@/domain/reference'
import { filterReferenceByYearRange } from '@/domain/reference'
import { logServiceError } from '@/lib/logger'

const STORTING_URL =
  'https://www.stortinget.no/no/Stortinget-og-demokratiet/Representantene/Okonomiske-rettigheter/Lonnsutvikling/'

type ParsedRow = { year: number; value: number | null; effectiveFrom?: string }

const SERVICE_NAME = 'stortingSalaryService'

function createServiceError(message: string): Error {
  return new Error(`${SERVICE_NAME}: ${message}`)
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim()
}

function parseAmount(value: string): number | null {
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return null
  return Number.parseInt(digits, 10)
}

function parseDateYear(dateStr: string): { year: number; effectiveFrom?: string } | null {
  const parts = dateStr.split('.')
  const year = Number.parseInt(parts.at(-1) ?? '', 10)
  if (!year || Number.isNaN(year)) return null
  return { year, effectiveFrom: dateStr }
}

function extractReferenceSeries(html: string): ParsedRow[] {
  const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)]
  if (tables.length === 0) throw createServiceError('Stortinget table not found in HTML')

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

  const looksLikeDate = (value: string) => /\d{2}\.\d{2}\.\d{4}/.test(value)

  for (const tableMatch of tables) {
    const tableHtml = tableMatch[0]
    const rowMatches = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    if (rowMatches.length < 2) continue

    const parsedRows: string[][] = rowMatches.map(row =>
      [...(row[1] ?? '').matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(cell =>
        stripHtml(cell[1] ?? ''),
      ),
    )

    // find column by scanning all rows for the header text
    const columnIndex = parsedRows.reduce((found, cells) => {
      if (found !== -1) return found
      return cells.findIndex(cell => {
        const normalized = normalize(cell)
        return (
          normalized.includes('stortingsrepresentant') ||
          normalized.includes('stortingsrepresentanter') ||
          normalized.includes('stortinget') ||
          normalized.includes('representant')
        )
      })
    }, -1)

    if (columnIndex === -1) continue

    const dataRows: ParsedRow[] = []

    for (const cells of parsedRows.slice(1)) {
      if (cells.length <= columnIndex) continue
      if (!looksLikeDate(cells[0] ?? '')) continue

      const dateInfo = parseDateYear(cells[0] ?? '')
      if (!dateInfo) continue
      const amount = parseAmount(cells[columnIndex] ?? '')
      dataRows.push({
        year: dateInfo.year,
        value: amount,
        effectiveFrom: dateInfo.effectiveFrom,
      })
    }

    if (dataRows.length > 0) return dataRows
  }

  throw createServiceError('Stortingsrepresentant column not found')
}

async function fetchStortingHtml(): Promise<string> {
  const res = await fetch(STORTING_URL, {
    headers: {
      Accept: 'text/html',
    },
  })
  if (!res.ok) {
    throw createServiceError(`Stortinget request failed (${res.status})`)
  }
  return res.text()
}

const buildResponse = (
  series: ReferenceDataPoint[],
  opts?: { note?: string; effectiveFrom?: string },
): ReferenceSalaryResponse => {
  return {
    source: { provider: 'Stortinget', table: 'Lonnsutvikling' },
    occupation: { code: 'stortingsrepresentant', label: 'Stortingsrepresentant' },
    filters: { column: 'Stortingsrepresentanter', source: STORTING_URL },
    unit: 'NOK/year',
    reference: { effectiveFrom: opts?.effectiveFrom },
    series,
    notes: [
      opts?.note ??
        'Data scraped from Stortinget historical compensation table (annual, effective 1. mai).',
      'Source updates annually; cached aggressively for stability.',
    ],
  }
}

let cachedFallback: {
  series: ReferenceDataPoint[]
  effectiveFrom?: string
  cachedAt: string
} | null = null

const loadStortingSeries = cache(async (fromYear: number): Promise<ReferenceSalaryResponse> => {
  'use cache'
  cacheLife('ssb') // reuse long-lived cache profile (annual updates)
  cacheTag('storting-salary')

  try {
    const html = await fetchStortingHtml()
    const parsed = extractReferenceSeries(html).sort((a, b) => a.year - b.year)
    const mapped: ReferenceDataPoint[] = parsed.map(item => ({
      year: item.year,
      value: item.value,
      status: null,
      type: 'official',
    }))
    const filtered = filterReferenceByYearRange(mapped, fromYear, new Date().getFullYear())
    if (filtered.length === 0) {
      throw createServiceError('No rows parsed from Stortinget table')
    }

    cachedFallback = {
      series: mapped,
      effectiveFrom: parsed[parsed.length - 1]?.effectiveFrom,
      cachedAt: new Date().toISOString(),
    }

    return buildResponse(filtered, {
      note: 'Live-scraped from Stortinget historical compensation table.',
      effectiveFrom: parsed[parsed.length - 1]?.effectiveFrom,
    })
  } catch (error) {
    logServiceError(SERVICE_NAME, error, { fromYear })
    if (cachedFallback) {
      const fallbackFiltered = filterReferenceByYearRange(
        cachedFallback.series,
        fromYear,
        new Date().getFullYear(),
      )
      if (fallbackFiltered.length === 0) {
        throw createServiceError('Fallback data is empty for requested year range')
      }
      return {
        ...buildResponse(fallbackFiltered, {
          note: 'Fallback cache used due to Stortinget parsing failure.',
          effectiveFrom: cachedFallback.effectiveFrom,
        }),
        alerts: [
          {
            code: 'fallback',
            source: 'Stortinget',
            cachedAt: cachedFallback.cachedAt,
            reason: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      }
    }
    throw error
  }
})

export async function getStortingReferenceSalary(
  fromYear: number,
): Promise<ReferenceSalaryResponse> {
  return loadStortingSeries(fromYear)
}
