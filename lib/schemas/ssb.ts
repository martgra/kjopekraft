import { z } from 'zod'

// Minimal JSON-stat2 shape for SSB salary table 11418 and wage index table 11654
const JsonStatCategorySchema = z.object({
  index: z.union([z.array(z.string()), z.record(z.string(), z.number())]).optional(),
  label: z.record(z.string(), z.string()).optional(),
})

const JsonStatDimensionSchema = z.record(
  z.string(),
  z.object({
    category: JsonStatCategorySchema,
  }),
)

export const JsonStat2Schema = z.object({
  id: z.array(z.string()).optional(),
  size: z.array(z.number()).optional(),
  dimension: JsonStatDimensionSchema,
  value: z.array(z.number().nullable()),
  status: z.array(z.string().nullable()).optional(),
})

// Salary series point as returned by our API
export const SsbSalarySeriesPointSchema = z.object({
  year: z.number(),
  value: z.number().nullable(),
  status: z.string().nullable().optional(),
  type: z.enum(['official', 'estimated']),
  method: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
})

export const SsbSalaryResponseSchema = z.object({
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
  reference: z.object({ month: z.literal('November') }),
  series: z.array(SsbSalarySeriesPointSchema),
  derived: z
    .object({
      yearlyNok: z.array(SsbSalarySeriesPointSchema).optional(),
    })
    .optional(),
  notes: z.array(z.string()).optional(),
})

export type JsonStat2 = z.infer<typeof JsonStat2Schema>
export type SsbSalaryResponse = z.infer<typeof SsbSalaryResponseSchema>
