import { useState, useEffect, useMemo } from 'react'
import { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'

const STORAGE_KEY = 'salary-calculator-points'

interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

/**
 * Hook for managing salary points in localStorage, without example fallbacks.
 * @param inflationData - Array of inflation records to determine valid year range
 */
export function useSalaryPoints(inflationData: InflationDataPoint[]) {
  const [isLoading, setIsLoading] = useState(true)
  const [payPoints, setPayPoints] = useState<PayPoint[]>([])

  // Initialize from localStorage only (no default examples)
  useEffect(() => {
    if (!inflationData.length) return

    let initial: PayPoint[] = []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        initial = JSON.parse(stored) as PayPoint[]
      }
    } catch (err) {
      console.error('Error loading salary points:', err)
    }

    setPayPoints(initial.sort((a, b) => a.year - b.year))
    setIsLoading(false)
  }, [inflationData])

  // Persist to localStorage on changes; clear key if empty
  useEffect(() => {
    if (isLoading) return
    try {
      if (payPoints.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payPoints))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (err) {
      console.error('Error saving salary points:', err)
    }
  }, [payPoints, isLoading])

  // Validate a salary point against inflation data range
  const validatePoint = (pt: PayPoint): ValidationResult => {
    const currentYear = new Date().getFullYear()
    const minYear = Math.min(...inflationData.map(d => d.year))

    if (pt.year == null || isNaN(pt.year)) {
      return { isValid: false, errorMessage: 'Year is required and must be a number' }
    }
    if (pt.year < minYear || pt.year > currentYear) {
      return {
        isValid: false,
        errorMessage: `Year must be between ${minYear} and ${currentYear}`,
      }
    }
    if (pt.pay == null || isNaN(pt.pay) || pt.pay <= 0) {
      return { isValid: false, errorMessage: 'Pay must be greater than 0' }
    }
    return { isValid: true }
  }

  // CRUD operations
  const addPoint = (pt: PayPoint): ValidationResult => {
    const result = validatePoint(pt)
    if (result.isValid) {
      setPayPoints(curr => [...curr, pt].sort((a, b) => a.year - b.year))
    }
    return result
  }

  const removePoint = (year: number, pay: number) => {
    setPayPoints(curr => curr.filter(p => !(p.year === year && p.pay === pay)))
  }

  const editPoint = (oldYear: number, oldPay: number, newPoint: PayPoint): ValidationResult => {
    const result = validatePoint(newPoint)
    if (result.isValid) {
      setPayPoints(curr =>
        [...curr.filter(p => !(p.year === oldYear && p.pay === oldPay)), newPoint].sort(
          (a, b) => a.year - b.year,
        ),
      )
    }
    return result
  }

  const resetPoints = () => {
    setPayPoints([])
  }

  return useMemo(
    () => ({
      payPoints,
      addPoint,
      removePoint,
      editPoint,
      resetPoints,
      validatePoint,
      isLoading,
    }),
    [payPoints, isLoading],
  )
}
