import { z } from 'zod'

/**
 * Zod schemas for inflation data
 * These provide runtime validation at API boundaries
 */

// Individual inflation data point
export const InflationDataPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  inflation: z.number(),
})

export type InflationDataPoint = z.infer<typeof InflationDataPointSchema>

// Array of inflation data points
export const InflationDataSchema = z.array(InflationDataPointSchema)

// SSB raw response structure for inflation
export const SsbInflationDimensionSchema = z.object({
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
      role: z.record(z.string(), z.string()),
      Konsumgrp: SsbInflationDimensionSchema,
      Tid: SsbInflationDimensionSchema,
      ContentsCode: SsbInflationDimensionSchema,
    }),
  }),
})

export type SsbInflationResponse = z.infer<typeof SsbInflationResponseSchema>

/**
 * Validates inflation data array
 * @throws ZodError if validation fails
 */
export function validateInflationData(data: unknown): InflationDataPoint[] {
  return InflationDataSchema.parse(data)
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidateInflationData(data: unknown) {
  return InflationDataSchema.safeParse(data)
}

/**
 * Validates raw SSB inflation response
 */
export function validateSsbInflationResponse(data: unknown) {
  return SsbInflationResponseSchema.parse(data)
}
