import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { parseJsonInflation } from '@/domain/inflation'
import type { InflationDataPoint } from '@/domain/inflation'
import { SsbInflationResponseSchema } from '@/lib/schemas'
import { logServiceError } from '@/lib/logger'

const SERVICE_NAME = 'inflationService'
const FETCH_TIMEOUT_MS = 4000

/**
 * SSB Consumer Price Index (KPI), 12-month % change, monthly series.
 * Table 14700 replaced the retired table 03013 on 2026-02-10.
 * `valueCodes[Tid]=*` returns the full time series; we filter to a single
 * metric so the response stays compact (one value per month).
 */
const SSB_INFLATION_URL =
  'https://data.ssb.no/api/pxwebapi/v2-beta/tables/14700/data' +
  '?lang=no&format=json-stat2' +
  '&valueCodes%5BTid%5D=*' +
  '&valueCodes%5BContentsCode%5D=Tolvmanedersendring'

function createServiceError(message: string): Error {
  return new Error(`${SERVICE_NAME}: ${message}`)
}

/**
 * Fetch and cache inflation data from SSB.
 * Server-side only — uses Next.js cache directives.
 * Includes Zod runtime validation of API response.
 */
const fetchInflation = async (): Promise<InflationDataPoint[]> => {
  'use cache'
  cacheLife('inflation') // Uses custom profile from next.config.ts
  cacheTag('inflation')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  const res = await fetch(SSB_INFLATION_URL, { signal: controller.signal }).finally(() =>
    clearTimeout(timeoutId),
  )
  if (!res.ok) throw createServiceError(`SSB fetch failed (${res.status})`)

  const rawJson = await res.json()

  const parseResult = SsbInflationResponseSchema.safeParse(rawJson)
  if (!parseResult.success) {
    logServiceError(SERVICE_NAME, parseResult.error, {
      component: SERVICE_NAME,
      action: 'validateResponse',
    })
    throw createServiceError('Invalid SSB response format')
  }

  return parseJsonInflation(parseResult.data)
}

// Memoize per-request to avoid duplicate fetch/parse in the same render pass
export const getInflationData = cache(fetchInflation)
