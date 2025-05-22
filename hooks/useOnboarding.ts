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
    // Remove all app-specific localStorage keys
    localStorage.removeItem(ONBOARDED_KEY)
    localStorage.removeItem('salary-calculator-points')
    localStorage.removeItem('salaryDisplayMode')
    localStorage.removeItem('salary-onboarding-v1')
    // Negotiation tab keys
    localStorage.removeItem('negotiation_data_points')
    localStorage.removeItem('negotiation_data_email')
    localStorage.removeItem('negotiation_data_playbook')
    localStorage.removeItem('negotiation_data_email_count')
    localStorage.removeItem('negotiation_data_playbook_count')
    // Remove last tab
    localStorage.removeItem('salary-last-tab')
    window.location.reload()
  }, [])

  return { hasOnboarded, finish, reset }
}
