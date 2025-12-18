import { z } from 'zod'

/**
 * Negotiation-related schemas for validating URL-persisted state.
 */

export const NegotiationPointSchema = z.object({
  description: z.string().min(1),
  type: z.string().min(1),
})

export const NegotiationUserInfoSchema = z.object({
  jobTitle: z.string().default(''),
  industry: z.string().default(''),
  isNewJob: z.preprocess(val => (val === null ? false : val), z.boolean()).default(false),
  currentSalary: z.string().default(''),
  desiredSalary: z.string().default(''),
  achievements: z.string().default(''),
  marketData: z.string().default(''),
  benefits: z.array(z.string()).default([]),
  otherBenefits: z.string().default(''),
})

export const NegotiationPointArraySchema = z.array(NegotiationPointSchema)

export type NegotiationPoint = z.infer<typeof NegotiationPointSchema>
export type NegotiationUserInfo = z.infer<typeof NegotiationUserInfoSchema>
