/**
 * Inflation domain types
 */

export interface InflationDataPoint {
  year: number
  inflation: number
}

export type SsbRawResponse = {
  dataset: {
    // All the data values, laid out in row-major order
    value: number[]
    // (Optional metadata)
    label: string
    source: string
    updated: string
    // The dimension info holds both the category-index maps *and* the size/id/role arrays
    dimension: {
      // Number of items in each dimension, same order as `id`
      size: number[]
      // Names of each dimension, e.g. ["Konsumgrp","Tid","ContentsCode"]
      id: string[]
      // Roles for each dimension, e.g. { "time": ["Tid"], "metric": ["ContentsCode"], ... }
      role: Record<string, string[]>
      // Then the per-dimension category→index maps:
      Konsumgrp: { category: { index: Record<string, number> } }
      Tid: { category: { index: Record<string, number> } }
      ContentsCode: { category: { index: Record<string, number> } }
    }
  }
}
