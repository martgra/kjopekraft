import { z } from 'zod'
import {
  NegotiationPointArraySchema,
  NegotiationUserInfoSchema,
  NegotiationPointSchema,
} from '@/lib/schemas'

export const NEGOTIATION_DRAFT_COOKIE = 'negotiation_draft'

const NegotiationDraftSchema = z.object({
  points: NegotiationPointArraySchema.default([]),
  emailContent: z.string().default(''),
  emailPrompt: z.string().default(''),
  emailGenerationCount: z.number().int().min(0).default(0),
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

export function readDraftFromDocument(): NegotiationDraft {
  if (typeof document === 'undefined') return defaultNegotiationDraft
  const raw = document.cookie
    .split('; ')
    .find(part => part.startsWith(`${NEGOTIATION_DRAFT_COOKIE}=`))
    ?.split('=')[1]
  return parseDraft(raw)
}

export function serializeDraft(draft: NegotiationDraft): string {
  // Keep payload compact; only required fields
  const payload = {
    points: draft.points.map(p => NegotiationPointSchema.parse(p)),
    emailContent: draft.emailContent || '',
    emailPrompt: draft.emailPrompt || '',
    emailGenerationCount: draft.emailGenerationCount ?? 0,
    userInfo: NegotiationUserInfoSchema.parse(draft.userInfo),
  }
  return encodeURIComponent(JSON.stringify(payload))
}

/**
 * Immediately writes the draft to a client-side cookie.
 * This provides instant persistence without waiting for server action to complete.
 */
export function writeDraftToDocument(draft: NegotiationDraft): void {
  if (typeof document === 'undefined') return

  const serialized = serializeDraft(draft)
  const maxAge = 60 * 60 * 24 * 14 // two weeks in seconds

  // Set cookie with same settings as server action
  document.cookie = `${NEGOTIATION_DRAFT_COOKIE}=${serialized}; path=/; max-age=${maxAge}; samesite=lax${
    process.env.NODE_ENV === 'production' ? '; secure' : ''
  }`
}
