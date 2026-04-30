/**
 * Inflation domain types
 */

export interface InflationDataPoint {
  year: number
  inflation: number
}

/**
 * SSB JSON-stat 2 response shape (PxWebApi 2.0).
 * Returned by `https://data.ssb.no/api/pxwebapi/v2-beta/tables/{id}/data?format=json-stat2`.
 *
 * We query a single metric (`Tolvmanedersendring`, the 12-month % change), so the layout
 * is one metric × N months. Some early months can be `null` if no value was published yet.
 */
export type SsbRawResponse = {
  value: (number | null)[]
  label: string
  source: string
  updated: string
  id: string[]
  size: number[]
  role: Record<string, string[]>
  dimension: {
    Tid: { category: { index: Record<string, number> } }
    ContentsCode: { category: { index: Record<string, number> } }
  }
}
