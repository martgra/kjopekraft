import { z } from 'zod'

/**
 * Zod schemas for inflation data.
 * Validates the SSB PxWebApi 2.0 JSON-stat 2 response at the network boundary.
 */

const InflationDataPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  inflation: z.number(),
})

const InflationDataSchema = z.array(InflationDataPointSchema)
void InflationDataSchema

const SsbDimensionCategorySchema = z.object({
  category: z.object({
    index: z.record(z.string(), z.number()),
  }),
})

export const SsbInflationResponseSchema = z.object({
  // Some monthly values can be null (e.g. before a series begins).
  value: z.array(z.number().nullable()),
  label: z.string(),
  source: z.string(),
  updated: z.string(),
  id: z.array(z.string()),
  size: z.array(z.number()),
  role: z.record(z.string(), z.array(z.string())),
  dimension: z.object({
    Tid: SsbDimensionCategorySchema,
    ContentsCode: SsbDimensionCategorySchema,
  }),
})
