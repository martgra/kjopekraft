import { useState, useEffect } from 'react'
import { NegotiationPoint } from '../../../lib/models/types'

const MAX_GENERATIONS = process.env.NODE_ENV === 'development' ? Infinity : 2
const STORAGE_KEY = 'negotiation_data'

// Helper functions to safely interact with localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    const item = localStorage.getItem(key)
    // If the item exists, parse it and validate if it's a number
    if (item) {
      const parsedValue = JSON.parse(item)
      // For number values, ensure they are valid numbers and not corrupted
      if (
        typeof defaultValue === 'number' &&
        (typeof parsedValue !== 'number' || isNaN(parsedValue) || parsedValue < 0)
      ) {
        console.warn(`Invalid value for ${key}, resetting to default`)
        return defaultValue
      }
      return parsedValue
    }
    return defaultValue
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error)
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

/**
 * Hook for managing negotiation data with persistent storage
 * Note: This hook must be used in client-only components (no SSR)
 */
export function useNegotiationData() {
  // Load initial values from localStorage
  const [points, setPoints] = useState<NegotiationPoint[]>(() =>
    getFromStorage<NegotiationPoint[]>(`${STORAGE_KEY}_points`, []),
  )

  const [emailContent, setEmailContentState] = useState<string>(() =>
    getFromStorage<string>(`${STORAGE_KEY}_email`, ''),
  )

  const [playbookContent, setPlaybookContentState] = useState<string>(() =>
    getFromStorage<string>(`${STORAGE_KEY}_playbook`, ''),
  )

  const [emailGenerationCount, setEmailGenerationCount] = useState<number>(() =>
    getFromStorage<number>(`${STORAGE_KEY}_email_count`, 0),
  )

  const [playbookGenerationCount, setPlaybookGenerationCount] = useState<number>(() =>
    getFromStorage<number>(`${STORAGE_KEY}_playbook_count`, 0),
  )

  // Save points to localStorage whenever they change
  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}_points`, points)
  }, [points])

  // Save email content to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}_email`, emailContent)
  }, [emailContent])

  // Save playbook content to localStorage whenever it changes
  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}_playbook`, playbookContent)
  }, [playbookContent])

  // Save generation counts to localStorage whenever they change
  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}_email_count`, emailGenerationCount)

    // For backward compatibility
    saveToStorage('negotiation_email_count', emailGenerationCount)
  }, [emailGenerationCount])

  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}_playbook_count`, playbookGenerationCount)

    // For backward compatibility
    saveToStorage('negotiation_playbook_count', playbookGenerationCount)
  }, [playbookGenerationCount])

  // Points management
  function addPoint(point: NegotiationPoint) {
    setPoints(prev => [...prev, point])
  }

  function removePoint(idx: number) {
    setPoints(prev => prev.filter((_, i) => i !== idx))
  }

  function clearPoints() {
    setPoints([])
  }

  // Content management
  function setEmail(content: string) {
    setEmailContentState(content)
    incrementEmailGenerationCount()
  }

  function setPlaybook(content: string) {
    setPlaybookContentState(content)
    incrementPlaybookGenerationCount()
  }

  // Generation counter management
  function incrementEmailGenerationCount() {
    setEmailGenerationCount(prev => {
      // Ensure we have a valid number before incrementing
      const validPrev = typeof prev === 'number' && !isNaN(prev) ? prev : 0
      return Math.min(validPrev + 1, MAX_GENERATIONS)
    })
  }

  function incrementPlaybookGenerationCount() {
    setPlaybookGenerationCount(prev => {
      // Ensure we have a valid number before incrementing
      const validPrev = typeof prev === 'number' && !isNaN(prev) ? prev : 0
      return Math.min(validPrev + 1, MAX_GENERATIONS)
    })
  }

  function resetGenerationCounts() {
    setEmailGenerationCount(0)
    setPlaybookGenerationCount(0)
  }

  function hasReachedEmailGenerationLimit() {
    // Ensure the count is valid before checking the limit
    return (
      typeof emailGenerationCount === 'number' &&
      !isNaN(emailGenerationCount) &&
      emailGenerationCount >= MAX_GENERATIONS
    )
  }

  function hasReachedPlaybookGenerationLimit() {
    // Ensure the count is valid before checking the limit
    return (
      typeof playbookGenerationCount === 'number' &&
      !isNaN(playbookGenerationCount) &&
      playbookGenerationCount >= MAX_GENERATIONS
    )
  }

  // Validate generation counts
  const validateCounts = () => {
    // Check if counts are potentially corrupted and fix them if needed
    if (
      typeof emailGenerationCount !== 'number' ||
      isNaN(emailGenerationCount) ||
      emailGenerationCount < 0
    ) {
      console.warn('Fixing corrupted email generation count')
      setEmailGenerationCount(0)
    }

    if (
      typeof playbookGenerationCount !== 'number' ||
      isNaN(playbookGenerationCount) ||
      playbookGenerationCount < 0
    ) {
      console.warn('Fixing corrupted playbook generation count')
      setPlaybookGenerationCount(0)
    }
  }

  // Run validation once on mount
  useEffect(() => {
    validateCounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Add a function to handle emergency reset - useful for users with corrupt data
  function forceResetAllData() {
    setPoints([])
    setEmailContentState('')
    setPlaybookContentState('')
    resetGenerationCounts()

    // Clear all related localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_KEY}_points`)
        localStorage.removeItem(`${STORAGE_KEY}_email`)
        localStorage.removeItem(`${STORAGE_KEY}_playbook`)
        localStorage.removeItem(`${STORAGE_KEY}_email_count`)
        localStorage.removeItem(`${STORAGE_KEY}_playbook_count`)
        localStorage.removeItem('negotiation_email_count')
        localStorage.removeItem('negotiation_playbook_count')
      } catch (error) {
        console.error('Error clearing negotiation data:', error)
      }
    }
  }

  return {
    // Data points
    points,
    addPoint,
    removePoint,
    clearPoints,

    // Generated content
    emailContent,
    playbookContent,
    setEmail,
    setPlaybook,

    // Generation counts
    emailGenerationCount,
    playbookGenerationCount,
    incrementEmailGenerationCount,
    incrementPlaybookGenerationCount,
    resetGenerationCounts,
    hasReachedEmailGenerationLimit,
    hasReachedPlaybookGenerationLimit,

    // Emergency reset for corrupted data
    forceResetAllData,
    validateCounts,

    // Constants
    MAX_GENERATIONS,
  }
}
