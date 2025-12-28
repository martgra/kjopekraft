import { useActionState, useMemo, useOptimistic, useState, startTransition } from 'react'
import type { NegotiationPoint } from '@/lib/schemas/negotiation'
import {
  defaultNegotiationDraft,
  readDraftFromDocument,
  writeDraftToDocument,
  type NegotiationDraft,
} from '@/features/negotiation/utils/draftCookie'
import { saveNegotiationDraft } from '@/features/negotiation/actions/saveNegotiationDraft'
import { NegotiationUserInfoSchema } from '@/lib/schemas/negotiation'

type SaveState =
  | { status: 'idle' }
  | { status: 'saving' }
  | { status: 'saved' }
  | { status: 'error'; message: string }

/**
 * Hook for managing negotiation data with persistent storage
 * Uses a lightweight cookie + server action to survive refreshes
 */
export function useNegotiationData() {
  const initialDraft = useMemo(readDraftFromDocument, [])

  const [draft, setDraft] = useState<NegotiationDraft>(initialDraft)
  const [optimisticDraft, setOptimisticDraft] = useOptimistic<NegotiationDraft>(draft)
  const [saveState, saveDraftAction, isSaving] = useActionState<SaveState, FormData>(
    saveNegotiationDraft,
    { status: 'idle' },
  )
  const currentDraft = optimisticDraft ?? draft ?? defaultNegotiationDraft

  const persistDraft = (
    nextDraft: NegotiationDraft | ((prev: NegotiationDraft) => NegotiationDraft),
  ) => {
    startTransition(() => {
      let resolved: NegotiationDraft | undefined

      setDraft(prev => {
        resolved = typeof nextDraft === 'function' ? nextDraft(prev) : nextDraft
        return resolved ?? defaultNegotiationDraft
      })

      const payload = resolved ?? defaultNegotiationDraft
      setOptimisticDraft(payload)

      // Immediately write to client-side cookie for instant persistence
      writeDraftToDocument(payload)

      // Also save via server action for server-side synchronization
      const formData = new FormData()
      formData.append('draft', JSON.stringify(payload))
      saveDraftAction(formData)
    })
  }

  const safeUserInfo = (value: NegotiationDraft['userInfo']) =>
    NegotiationUserInfoSchema.parse(value)

  // Points management
  function addPoint(point: NegotiationPoint) {
    persistDraft(prev => ({ ...prev, points: [...prev.points, point] }))
  }

  function removePoint(idx: number) {
    persistDraft(prev => ({ ...prev, points: prev.points.filter((_, i) => i !== idx) }))
  }

  function clearPoints() {
    persistDraft(prev => ({ ...prev, points: [] }))
  }

  // Content management
  function setEmail(content: string, prompt?: string) {
    persistDraft(prev => ({
      ...prev,
      emailContent: content,
      emailPrompt: prompt ?? prev.emailPrompt,
    }))
  }

  function updateUserInfo(updates: Partial<NegotiationDraft['userInfo']>) {
    persistDraft(prev => {
      const merged = safeUserInfo({ ...prev.userInfo, ...updates })
      return { ...prev, userInfo: merged }
    })
  }

  // Add a function to handle emergency reset - useful for users with corrupt data
  function forceResetAllData() {
    persistDraft(defaultNegotiationDraft)
  }

  return {
    // Data points
    points: currentDraft.points,
    addPoint,
    removePoint,
    clearPoints,

    // Generated content
    emailContent: currentDraft.emailContent,
    setEmail,

    // Prompts
    emailPrompt: currentDraft.emailPrompt,
    setEmailPrompt: (prompt: string) =>
      persistDraft(prev => ({
        ...prev,
        emailPrompt: prompt,
      })),

    // User info
    userInfo: currentDraft.userInfo,
    updateUserInfo,

    // Emergency reset for corrupted data
    forceResetAllData,
    saveState,
    isSaving,
  }
}
