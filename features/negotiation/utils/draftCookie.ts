import {
  defaultNegotiationDraft,
  parseDraft,
  serializeDraft,
  type NegotiationDraft,
} from '@/lib/negotiation/draft'
import { NEGOTIATION_DRAFT_COOKIE } from '@/lib/constants/cookies'

export function readDraftFromDocument(): NegotiationDraft {
  if (typeof document === 'undefined') return defaultNegotiationDraft
  const raw = document.cookie
    .split('; ')
    .find(part => part.startsWith(`${NEGOTIATION_DRAFT_COOKIE}=`))
    ?.split('=')[1]
  return parseDraft(raw)
}

export {
  defaultNegotiationDraft,
  parseDraft,
  serializeDraft,
  type NegotiationDraft,
  NEGOTIATION_DRAFT_COOKIE,
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
