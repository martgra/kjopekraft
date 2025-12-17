import { useActionState, useMemo, useOptimistic, useState, startTransition } from 'react'
import type { NegotiationPoint } from '@/lib/models/types'
import {
  defaultNegotiationDraft,
  readDraftFromDocument,
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

  const persistDraft = (nextDraft: NegotiationDraft) => {
    const formData = new FormData()
    formData.append('draft', JSON.stringify(nextDraft))
    startTransition(() => {
      setOptimisticDraft(nextDraft)
      setDraft(nextDraft)
      saveDraftAction(formData)
    })
  }

  const safeUserInfo = (value: NegotiationDraft['userInfo']) =>
    NegotiationUserInfoSchema.parse(value)

  // Points management
  function addPoint(point: NegotiationPoint) {
    const nextDraft = { ...draft, points: [...draft.points, point] }
    persistDraft(nextDraft)
  }

  function removePoint(idx: number) {
    const nextDraft = { ...draft, points: draft.points.filter((_, i) => i !== idx) }
    persistDraft(nextDraft)
  }

  function clearPoints() {
    const nextDraft = { ...draft, points: [] }
    persistDraft(nextDraft)
  }

  // Content management
  function setEmail(content: string) {
    const validPrev =
      typeof draft.emailGenerationCount === 'number' && !isNaN(draft.emailGenerationCount)
        ? draft.emailGenerationCount
        : 0
    const nextDraft = {
      ...draft,
      emailContent: content,
      emailGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
    }
    persistDraft(nextDraft)
  }

  function setPlaybook(content: string) {
    const validPrev =
      typeof draft.playbookGenerationCount === 'number' && !isNaN(draft.playbookGenerationCount)
        ? draft.playbookGenerationCount
        : 0
    const nextDraft = {
      ...draft,
      playbookContent: content,
      playbookGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
    }
    persistDraft(nextDraft)
  }

  // Generation counter management
  function incrementEmailGenerationCount() {
    const validPrev =
      typeof draft.emailGenerationCount === 'number' && !isNaN(draft.emailGenerationCount)
        ? draft.emailGenerationCount
        : 0
    const nextDraft = {
      ...draft,
      emailGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
    }
    persistDraft(nextDraft)
  }

  function incrementPlaybookGenerationCount() {
    const validPrev =
      typeof draft.playbookGenerationCount === 'number' && !isNaN(draft.playbookGenerationCount)
        ? draft.playbookGenerationCount
        : 0
    const nextDraft = {
      ...draft,
      playbookGenerationCount: Math.min(validPrev + 1, MAX_GENERATIONS),
    }
    persistDraft(nextDraft)
  }

  function resetGenerationCounts() {
    const nextDraft = { ...draft, emailGenerationCount: 0, playbookGenerationCount: 0 }
    persistDraft(nextDraft)
  }

  function hasReachedEmailGenerationLimit() {
    // Ensure the count is valid before checking the limit
    return (
      typeof draft.emailGenerationCount === 'number' &&
      !isNaN(draft.emailGenerationCount) &&
      draft.emailGenerationCount >= MAX_GENERATIONS
    )
  }

  function hasReachedPlaybookGenerationLimit() {
    // Ensure the count is valid before checking the limit
    return (
      typeof draft.playbookGenerationCount === 'number' &&
      !isNaN(draft.playbookGenerationCount) &&
      draft.playbookGenerationCount >= MAX_GENERATIONS
    )
  }

  function updateUserInfo(updates: Partial<NegotiationDraft['userInfo']>) {
    const merged = safeUserInfo({ ...draft.userInfo, ...updates })
    const nextDraft = { ...draft, userInfo: merged }
    persistDraft(nextDraft)
  }

  // Add a function to handle emergency reset - useful for users with corrupt data
  function forceResetAllData() {
    persistDraft(defaultNegotiationDraft)
  }

  return {
    // Data points
    points: optimisticDraft.points,
    addPoint,
    removePoint,
    clearPoints,

    // Generated content
    emailContent: optimisticDraft.emailContent,
    playbookContent: optimisticDraft.playbookContent,
    setEmail,
    setPlaybook,

    // Prompts
    emailPrompt: optimisticDraft.emailPrompt,
    playbookPrompt: optimisticDraft.playbookPrompt,
    setEmailPrompt: (prompt: string) => persistDraft({ ...draft, emailPrompt: prompt }),
    setPlaybookPrompt: (prompt: string) => persistDraft({ ...draft, playbookPrompt: prompt }),

    // User info
    userInfo: optimisticDraft.userInfo,
    updateUserInfo,

    // Generation counts
    emailGenerationCount: optimisticDraft.emailGenerationCount,
    playbookGenerationCount: optimisticDraft.playbookGenerationCount,
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
