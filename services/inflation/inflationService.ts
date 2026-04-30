import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { parseJsonInflation } from '@/domain/inflation'
import type { InflationDataPoint } from '@/domain/inflation'
import { SsbInflationResponseSchema } from '@/lib/schemas'
import { logServiceError } from '@/lib/logger'

const SERVICE_NAME = 'inflationService'
const FETCH_TIMEOUT_MS = 4000

function createServiceError(message: string): Error {
  return new Error(`${SERVICE_NAME}: ${message}`)
}

/**
 * Fetch and cache inflation data from SSB
 * Server-side only - uses Next.js cache directives
 * Includes Zod runtime validation of API response
 */
const fetchInflation = async (): Promise<InflationDataPoint[]> => {
  'use cache'
  cacheLife('inflation') // Uses custom profile from next.config.ts
  cacheTag('inflation')

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  const SSB_URL =
    'https://data.ssb.no/api/pxwebapi/v2/tables/03013/data' +
    '?lang=no&outputformat=json-stat2' +
    '&valueCodes[Konsumgrp]=TOTAL' +
    '&valueCodes[ContentsCode]=Tolvmanedersendring' +
    '&valueCodes[Tid]=*'

  const res = await fetch(SSB_URL, {
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId))
  if (!res.ok) throw createServiceError(`SSB fetch failed (${res.status})`)

  const rawJson = await res.json()

  // Validate response structure with Zod
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
