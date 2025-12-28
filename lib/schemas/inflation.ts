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

// SSB raw response structure for inflation
const SsbInflationDimensionSchema = z.object({
  category: z.object({
    index: z.record(z.string(), z.number()),
  }),
})

export const SsbInflationResponseSchema = z.object({
  dataset: z.object({
    value: z.array(z.number()),
    label: z.string(),
    source: z.string(),
    updated: z.string(),
    dimension: z.object({
      size: z.array(z.number()),
      id: z.array(z.string()),
      // JSON-stat role maps semantic roles to dimension ids (arrays)
      role: z.record(z.string(), z.array(z.string())),
      Konsumgrp: SsbInflationDimensionSchema,
      Tid: SsbInflationDimensionSchema,
      ContentsCode: SsbInflationDimensionSchema,
    }),
  }),
})
