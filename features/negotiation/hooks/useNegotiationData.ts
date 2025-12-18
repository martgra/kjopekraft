import { useActionState, useMemo, useOptimistic, useState, startTransition } from 'react'
import type { NegotiationPoint } from '@/lib/models/types'
import {
  defaultNegotiationDraft,
  readDraftFromDocument,
  writeDraftToDocument,
  type NegotiationDraft,
} from '@/features/negotiation/utils/draftCookie'
import { saveNegotiationDraft } from '@/features/negotiation/actions/saveNegotiationDraft'
import { NegotiationUserInfoSchema } from '@/lib/schemas/negotiation'

const MAX_GENERATIONS = process.env.NODE_ENV === 'development' ? Infinity : 2

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
    persistDraft(prev => {
      const validPrev =
        typeof prev.emailGenerationCount === 'number' && !isNaN(prev.emailGenerationCount)
          ? prev.emailGenerationCount
          : 0
      return {
        ...prev,
        emailContent: content,
        emailPrompt: prompt ?? prev.emailPrompt,
        emailGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
      }
    })
  }

  function setPlaybook(content: string) {
    persistDraft(prev => {
      const validPrev =
        typeof prev.playbookGenerationCount === 'number' && !isNaN(prev.playbookGenerationCount)
          ? prev.playbookGenerationCount
          : 0
      return {
        ...prev,
        playbookContent: content,
        playbookGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
      }
    })
  }

  // Generation counter management
  function incrementEmailGenerationCount() {
    persistDraft(prev => {
      const validPrev =
        typeof prev.emailGenerationCount === 'number' && !isNaN(prev.emailGenerationCount)
          ? prev.emailGenerationCount
          : 0
      return {
        ...prev,
        emailGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
      }
    })
  }

  function incrementPlaybookGenerationCount() {
    persistDraft(prev => {
      const validPrev =
        typeof prev.playbookGenerationCount === 'number' && !isNaN(prev.playbookGenerationCount)
          ? prev.playbookGenerationCount
          : 0
      return {
        ...prev,
        playbookGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
      }
    })
  }

  function resetGenerationCounts() {
    persistDraft(prev => ({ ...prev, emailGenerationCount: 0, playbookGenerationCount: 0 }))
  }

  function hasReachedEmailGenerationLimit() {
    const value = currentDraft.emailGenerationCount
    return typeof value === 'number' && !isNaN(value) && value >= MAX_GENERATIONS
  }

  function hasReachedPlaybookGenerationLimit() {
    const value = currentDraft.playbookGenerationCount
    return typeof value === 'number' && !isNaN(value) && value >= MAX_GENERATIONS
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
    playbookContent: currentDraft.playbookContent,
    setEmail,
    setPlaybook,

    // Prompts
    emailPrompt: currentDraft.emailPrompt,
    playbookPrompt: currentDraft.playbookPrompt,
    setEmailPrompt: (prompt: string) =>
      persistDraft(prev => ({
        ...prev,
        emailPrompt: prompt,
      })),
    setPlaybookPrompt: (prompt: string) =>
      persistDraft(prev => ({
        ...prev,
        playbookPrompt: prompt,
      })),

    // User info
    userInfo: currentDraft.userInfo,
    updateUserInfo,

    // Generation counts
    emailGenerationCount: currentDraft.emailGenerationCount,
    playbookGenerationCount: currentDraft.playbookGenerationCount,
    incrementEmailGenerationCount,
    incrementPlaybookGenerationCount,
    resetGenerationCounts,
    hasReachedEmailGenerationLimit,
    hasReachedPlaybookGenerationLimit,

    // Emergency reset for corrupted data
    forceResetAllData,
    saveState,
    isSaving,

    // Constants
    MAX_GENERATIONS,
  }
}
