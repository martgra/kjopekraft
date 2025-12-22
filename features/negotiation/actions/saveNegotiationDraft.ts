'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  defaultNegotiationDraft,
  NEGOTIATION_DRAFT_COOKIE,
  serializeDraft,
} from '@/features/negotiation/utils/draftCookie'
import { NegotiationPointArraySchema, NegotiationUserInfoSchema } from '@/lib/schemas/negotiation'

const DraftInputSchema = z.object({
  points: NegotiationPointArraySchema.default([]),
  emailContent: z.string().default(''),
  emailPrompt: z.string().default(''),
  emailGenerationCount: z.number().int().min(0).default(0),
  userInfo: NegotiationUserInfoSchema.default(NegotiationUserInfoSchema.parse({})),
})

type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved' }
  | { status: 'error'; message: string }

export async function saveNegotiationDraft(
  _prevState: SaveState,
  formData: FormData,
): Promise<SaveState> {
  try {
    const raw = formData.get('draft')
    if (typeof raw !== 'string') {
      return { status: 'error', message: 'Draft payload missing' }
    }

    const parsedRaw = raw === 'undefined' ? null : raw
    const parsed = DraftInputSchema.parse(
      parsedRaw ? (JSON.parse(parsedRaw) ?? defaultNegotiationDraft) : defaultNegotiationDraft,
    )

    const cookieStore = await cookies()
    cookieStore.set(NEGOTIATION_DRAFT_COOKIE, serializeDraft(parsed), {
      httpOnly: false, // allow client-side rehydration
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 14, // two weeks
      path: '/',
    })

    return { status: 'saved' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to save negotiation draft', error)
    return { status: 'error', message }
  }
}
