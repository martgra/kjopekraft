import { useActionState, useEffect, useOptimistic, useState, startTransition } from 'react'
import type { NegotiationPoint } from '@/lib/schemas/negotiation'
import {
  defaultNegotiationDraft,
  readDraftFromDocument,
  writeDraftToDocument,
  type NegotiationDraft,
} from '@/features/negotiation/utils/draftCookie'
import { saveNegotiationDraft } from '@/features/negotiation/actions/saveNegotiationDraft'
import { NegotiationUserInfoSchema } from '@/lib/schemas/negotiation'
import { STORAGE_KEYS } from '@/lib/constants/storage'

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
  const [draft, setDraft] = useState<NegotiationDraft>(defaultNegotiationDraft)
  const [optimisticDraft, setOptimisticDraft] = useOptimistic<NegotiationDraft>(draft)
  const [saveState, saveDraftAction, isSaving] = useActionState<SaveState, FormData>(
    saveNegotiationDraft,
    { status: 'idle' },
  )
  const currentDraft = optimisticDraft ?? draft ?? defaultNegotiationDraft

  useEffect(() => {
    const storedDraft = readDraftFromDocument()
    let resolvedDraft = storedDraft

    try {
      const storedLocalDraft = window.localStorage.getItem(STORAGE_KEYS.negotiationDraft)
      if (storedLocalDraft) {
        const localDraft = JSON.parse(storedLocalDraft) as NegotiationDraft
        const hasLocalDraft =
          localDraft.points.length > 0 ||
          localDraft.emailContent.trim().length > 0 ||
          localDraft.emailPrompt.trim().length > 0 ||
          localDraft.userInfo.jobTitle.trim().length > 0 ||
          localDraft.userInfo.industry.trim().length > 0 ||
          localDraft.userInfo.currentSalary.trim().length > 0 ||
          localDraft.userInfo.desiredSalary.trim().length > 0 ||
          localDraft.userInfo.achievements.trim().length > 0 ||
          localDraft.userInfo.marketData.trim().length > 0 ||
          localDraft.userInfo.benefits.length > 0 ||
          localDraft.userInfo.otherBenefits.trim().length > 0
        const hasCookieDraft =
          storedDraft.points.length > 0 ||
          storedDraft.emailContent.trim().length > 0 ||
          storedDraft.emailPrompt.trim().length > 0 ||
          storedDraft.userInfo.jobTitle.trim().length > 0 ||
          storedDraft.userInfo.industry.trim().length > 0 ||
          storedDraft.userInfo.currentSalary.trim().length > 0 ||
          storedDraft.userInfo.desiredSalary.trim().length > 0 ||
          storedDraft.userInfo.achievements.trim().length > 0 ||
          storedDraft.userInfo.marketData.trim().length > 0 ||
          storedDraft.userInfo.benefits.length > 0 ||
          storedDraft.userInfo.otherBenefits.trim().length > 0
        resolvedDraft = hasCookieDraft ? storedDraft : hasLocalDraft ? localDraft : storedDraft
      }
    } catch (error) {
      console.warn('Failed to restore negotiation draft from storage', error)
    }

    setDraft(resolvedDraft)
    startTransition(() => {
      setOptimisticDraft(resolvedDraft)
    })
  }, [setOptimisticDraft])

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
      try {
        window.localStorage.setItem(STORAGE_KEYS.negotiationDraft, JSON.stringify(payload))
      } catch (error) {
        console.warn('Failed to persist negotiation draft to storage', error)
      }

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
