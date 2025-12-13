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
  playbookContent: z.string().default(''),
  emailPrompt: z.string().default(''),
  playbookPrompt: z.string().default(''),
  emailGenerationCount: z.number().int().min(0).default(0),
  playbookGenerationCount: z.number().int().min(0).default(0),
  userInfo: NegotiationUserInfoSchema.default(NegotiationUserInfoSchema.parse({})),
})

export type NegotiationDraft = z.infer<typeof NegotiationDraftSchema>

export const defaultNegotiationDraft: NegotiationDraft = NegotiationDraftSchema.parse({})

export function parseDraft(raw: string | undefined): NegotiationDraft {
  if (!raw) return defaultNegotiationDraft
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return NegotiationDraftSchema.parse(parsed)
  } catch (error) {
    console.warn('Failed to parse negotiation draft cookie, using defaults', error)
    return defaultNegotiationDraft
  }
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
    playbookContent: draft.playbookContent || '',
    emailPrompt: draft.emailPrompt || '',
    playbookPrompt: draft.playbookPrompt || '',
    emailGenerationCount: draft.emailGenerationCount ?? 0,
    playbookGenerationCount: draft.playbookGenerationCount ?? 0,
    userInfo: NegotiationUserInfoSchema.parse(draft.userInfo),
  }
  return encodeURIComponent(JSON.stringify(payload))
}
