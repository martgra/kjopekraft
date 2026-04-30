/**
 * Inflation domain types
 */

export interface InflationDataPoint {
  year: number
  inflation: number
}

// JSON-stat2 top-level shape returned by SSB PxWebApi v2
export type SsbRawResponse = {
  version: string
  class: 'dataset'
  label: string
  source: string
  updated: string
  // id and size are top-level in JSON-stat2 (unlike the old JSON-stat format)
  id: string[]
  size: number[]
  role: Record<string, string[]>
  dimension: {
    Konsumgrp: { category: { index: Record<string, number> } }
    Tid: { category: { index: Record<string, number> } }
    ContentsCode: { category: { index: Record<string, number> } }
  }
  value: (number | null)[]
}
