//hooks/useOnboarding.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { ONBOARDED_KEY } from '@/lib/constants'

export function useOnboarding() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    const flag = localStorage.getItem(ONBOARDED_KEY)
    setHasOnboarded(flag === 'true')
  }, [])

  const finish = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, 'true')
    setHasOnboarded(true)
  }, [])

  const reset = useCallback(() => {
    localStorage.removeItem(ONBOARDED_KEY)
    localStorage.removeItem('salary-calculator-points')
    window.location.reload()
  }, [])

  return { hasOnboarded, finish, reset }
}
