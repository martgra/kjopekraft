import { cookies } from 'next/headers'
import { NEGOTIATION_DRAFT_COOKIE, parseDraft } from './draftCookie'

export async function readDraftFromRequest() {
  const cookieStore = await cookies()
  const raw = cookieStore.get(NEGOTIATION_DRAFT_COOKIE)?.value
  return parseDraft(raw)
}
