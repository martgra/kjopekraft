'use client'

import { useState, useEffect, useMemo } from 'react'
import { adjustSalaries, calculateYearRange, validatePayPoint } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import type { PayChangeReason, PayPoint, SalaryDataPoint, ValidationResult } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { ChartPoint } from '@/lib/models/types'

const STORAGE_KEY = 'salary-calculator-points'
const DEFAULT_REASON: PayChangeReason = 'adjustment'

/**
 * A unified hook for managing salary data, calculations, and chart preparation
 * with proper memoization and caching.
 *
 * @param inflationData - Inflation data passed from server
 * @param currentYear - Current year (passed from server to avoid runtime Date access)
 */
export function useSalaryData(
  inflationData: InflationDataPoint[],
  currentYear: number,
  baseYearOverride?: number,
) {
  // Local state for pay points
  const [isLoading, setIsLoading] = useState(true)
  const [payPoints, setPayPoints] = useState<PayPoint[]>([])

  // Initialize from localStorage
  useEffect(() => {
    if (!inflationData.length) return

    let initial: PayPoint[] = []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as PayPoint[]
        initial = parsed.map(p => ({
          ...p,
          reason: (p as PayPoint).reason ?? DEFAULT_REASON,
        }))
      }
    } catch (err) {
      console.error('Error loading salary points:', err)
    }

    setPayPoints(initial.sort((a, b) => a.year - b.year))
    setIsLoading(false)
  }, [inflationData])

  // Persist to localStorage on changes
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

  // CRUD operations for payPoints
  const addPoint = (point: Omit<PayPoint, 'id'>) => {
    const id = crypto.randomUUID()
    setPayPoints(prev => [...prev, { ...point, id }].sort((a, b) => a.year - b.year))
  }

  const editPoint = (oldYear: number, oldPay: number, newPoint: PayPoint) => {
    setPayPoints(prev =>
      prev
        // If we have IDs, use those for matching, otherwise fall back to year and pay
        .map(p => {
          // If the point has an ID and it matches the newPoint ID
          if (p.id && newPoint.id && p.id === newPoint.id) {
            return newPoint
          }
          // Otherwise use the old matching logic
          if (p.year === oldYear && p.pay === oldPay) {
            return newPoint
          }
          return p
        })
        .sort((a, b) => a.year - b.year),
    )
  }

  const removePoint = (year: number, pay: number) => {
    setPayPoints(prev => prev.filter(p => !(p.year === year && p.pay === pay)))
  }

  // Validation function - delegates to domain layer
  const validatePoint = (point: PayPoint): ValidationResult => {
    return validatePayPoint(point, payPoints, inflationData)
  }

  // Memoized calculations
  const salaryData = useMemo<SalaryDataPoint[]>(
    () => adjustSalaries(payPoints, inflationData, currentYear, baseYearOverride),
    [payPoints, inflationData, currentYear, baseYearOverride],
  )

  const yearRange = useMemo(
    () => calculateYearRange(salaryData, currentYear),
    [salaryData, currentYear],
  )

  // Chart data preparation with memoization
  const chartData = useMemo(() => {
    // Only prepare chart data if we have the necessary inputs
    if (!payPoints.length || !inflationData.length) {
      return {
        actualSeries: [],
        inflSeries: [],
        netActualSeries: [],
        netInflSeries: [],
      }
    }

    // Convert salary points to chart format
    const actualPoints = payPoints.map<ChartPoint>(p => ({
      x: p.year,
      y: p.pay,
    }))

    // Create inflation series
    const inflPoints = salaryData.map<ChartPoint>(p => ({
      x: p.year,
      y: p.inflationAdjustedPay,
    }))

    // Create net pay versions (memoizing these saves recalculation when toggling gross/net)
    const netActualPoints = actualPoints.map<ChartPoint>(p => ({
      x: p.x,
      y: p.y !== null ? calculateNetIncome(p.y, p.x) : null,
    }))

    const netInflPoints = inflPoints.map<ChartPoint>(p => ({
      x: p.x,
      y: p.y !== null ? calculateNetIncome(p.y, p.x) : null,
    }))

    return {
      actualSeries: actualPoints,
      inflSeries: inflPoints,
      netActualSeries: netActualPoints,
      netInflSeries: netInflPoints,
    }
  }, [payPoints, inflationData, salaryData])

  const hasData = payPoints.length > 0

  return {
    // Data
    payPoints,
    inflationData,
    salaryData,

    // Chart data
    chartData,
    yearRange,

    hasData,

    // State management
    addPoint,
    editPoint,
    removePoint,
    validatePoint,

    // Status
    isLoading,
    error: null,
  }
}
