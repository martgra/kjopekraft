import { z } from 'zod'

/**
 * Zod schemas for inflation data
 * These provide runtime validation at API boundaries
 */

// Individual inflation data point
const InflationDataPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  inflation: z.number(),
})

// Array of inflation data points
const InflationDataSchema = z.array(InflationDataPointSchema)
void InflationDataSchema

// SSB raw response structure for inflation — JSON-stat2 top-level format
// (PxWebApi v2: https://data.ssb.no/api/pxwebapi/v2/tables/03013/data)
const SsbInflationDimensionSchema = z.object({
  category: z.object({
    index: z.record(z.string(), z.number()),
  }),
})

export const SsbInflationResponseSchema = z.object({
  version: z.string(),
  class: z.literal('dataset'),
  label: z.string(),
  source: z.string(),
  updated: z.string(),
  // JSON-stat2: id, size, role are top-level (not inside dimension)
  id: z.array(z.string()),
  size: z.array(z.number()),
  role: z.record(z.string(), z.array(z.string())),
  dimension: z.object({
    Konsumgrp: SsbInflationDimensionSchema,
    Tid: SsbInflationDimensionSchema,
    ContentsCode: SsbInflationDimensionSchema,
  }),
  value: z.array(z.number().nullable()),
})
