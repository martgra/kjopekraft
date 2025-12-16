'use client'

import { useEffect, useState } from 'react'

const MOBILE_BREAKPOINT = 1024

/**
 * Hook to detect if the current viewport is mobile-sized
 * Uses the lg breakpoint (1024px) to match Tailwind's responsive classes
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Initialize on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Check immediately
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}
