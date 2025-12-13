import { z } from 'zod'

/**
 * Zod schemas for SSB API responses
 * These provide runtime validation at API boundaries
 */

// JSON-stat2 format schemas
export const JsonStat2DimensionSchema = z.object({
  category: z.object({
    index: z.union([z.array(z.string()), z.record(z.string(), z.number())]).optional(),
    label: z.record(z.string(), z.string()).optional(),
  }),
})

export const JsonStat2Schema = z.object({
  id: z.array(z.string()).optional(),
  size: z.array(z.number()).optional(),
  dimension: z.record(z.string(), JsonStat2DimensionSchema),
  value: z.array(z.number().nullable()),
  status: z.array(z.string().nullable()).optional(),
})

export type JsonStat2 = z.infer<typeof JsonStat2Schema>

// Salary series point
export const SalarySeriesPointSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  value: z.number().nullable(),
  status: z.string().nullable().optional(),
  type: z.enum(['official', 'estimated']),
  method: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
})

export type SalarySeriesPoint = z.infer<typeof SalarySeriesPointSchema>

// Full salary response
export const SalarySeriesResponseSchema = z.object({
  source: z.object({
    provider: z.literal('SSB'),
    table: z.literal('11418'),
  }),
  occupation: z.object({
    code: z.string(),
    label: z.string().optional(),
  }),
  filters: z.object({
    contents: z.string(),
    stat: z.string(),
    sector: z.string(),
    sex: z.string(),
    hours: z.string(),
  }),
  unit: z.literal('NOK/month'),
  reference: z.object({
    month: z.literal('November'),
  }),
  series: z.array(SalarySeriesPointSchema),
  derived: z
    .object({
      yearlyNok: z.array(SalarySeriesPointSchema).optional(),
    })
    .optional(),
  notes: z.array(z.string()).optional(),
})

export type SalarySeriesResponse = z.infer<typeof SalarySeriesResponseSchema>

// Query parameters schema for salary API
export const SalaryQueryParamsSchema = z.object({
  occupation: z.string().min(1, 'Occupation code is required'),
  contents: z.string().default('Manedslonn'),
  stat: z.string().default('02'),
  sector: z.string().default('ALLE'),
  sex: z.string().default('0'),
  hours: z.string().default('0'),
  fromYear: z
    .string()
    .regex(/^\d{4}$/, 'fromYear must be a 4-digit year')
    .default('2015'),
})

export type SalaryQueryParams = z.infer<typeof SalaryQueryParamsSchema>

/**
 * Validates SSB JSON-stat2 response
 * @throws ZodError if validation fails
 */
export function validateJsonStat2Response(data: unknown): JsonStat2 {
  return JsonStat2Schema.parse(data)
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidateJsonStat2Response(data: unknown) {
  return JsonStat2Schema.safeParse(data)
}
