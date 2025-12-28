import { z } from 'zod'
import {
  NegotiationPointArraySchema,
  NegotiationUserInfoSchema,
  NegotiationPointSchema,
} from '@/lib/schemas'

const NegotiationDraftSchema = z.object({
  points: NegotiationPointArraySchema.default([]),
  emailContent: z.string().default(''),
  emailPrompt: z.string().default(''),
  userInfo: NegotiationUserInfoSchema.default(NegotiationUserInfoSchema.parse({})),
})

export type NegotiationDraft = z.infer<typeof NegotiationDraftSchema>

export const defaultNegotiationDraft: NegotiationDraft = NegotiationDraftSchema.parse({})

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function parseDraft(raw: string | undefined): NegotiationDraft {
  if (!raw) return defaultNegotiationDraft

  const attempts = [
    safeDecode(raw), // normal single-encoded cookie
    safeDecode(safeDecode(raw)), // double-encoded cookie from older clients
    raw, // already-decoded string
  ].filter((value, index, self) => self.indexOf(value) === index)

  let lastError: unknown
  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate)
      return NegotiationDraftSchema.parse(parsed)
    } catch (error) {
      lastError = error
    }
  }

  console.warn('Failed to parse negotiation draft cookie, using defaults', lastError)
  return defaultNegotiationDraft
}

export function serializeDraft(draft: NegotiationDraft): string {
  const payload = {
    points: draft.points.map(p => NegotiationPointSchema.parse(p)),
    emailContent: draft.emailContent || '',
    emailPrompt: draft.emailPrompt || '',
    userInfo: NegotiationUserInfoSchema.parse(draft.userInfo),
  }
  return encodeURIComponent(JSON.stringify(payload))
}
