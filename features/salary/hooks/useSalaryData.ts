'use client'

import { useState, useEffect, useMemo } from 'react'
import { adjustSalaries, computeStatistics } from '@/features/inflation/inflationCalc'
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import type {
  PayPoint,
  SalaryDataPoint,
  SalaryStatistics,
  ChartPoint,
  ValidationResult,
} from '@/lib/models/types'
import type { InflationDataPoint } from '@/lib/models/inflation'

const STORAGE_KEY = 'salary-calculator-points'

/**
 * A unified hook for managing salary data, calculations, and chart preparation
 * with proper memoization and caching.
 *
 * @param inflationData - Inflation data passed from server
 * @param currentYear - Current year (passed from server to avoid runtime Date access)
 */
export function useSalaryData(inflationData: InflationDataPoint[], currentYear: number) {
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
        initial = JSON.parse(stored) as PayPoint[]
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

  // Validation function
  const validatePoint = (point: PayPoint): ValidationResult => {
    if (!point.year || !point.pay) {
      return { isValid: false, errorMessage: 'Year and pay are required' }
    }

    if (point.pay <= 0) {
      return { isValid: false, errorMessage: 'Pay must be positive' }
    }

    if (inflationData.length) {
      const minYear = Math.min(...inflationData.map(d => d.year))
      const maxYear = Math.max(...inflationData.map(d => d.year))

      if (point.year < minYear || point.year > maxYear) {
        return {
          isValid: false,
          errorMessage: `Year must be between ${minYear} and ${maxYear}`,
        }
      }
    }

    // Check for duplicate year
    const existingWithSameYear = payPoints.find(p => p.year === point.year && p.id !== point.id)
    if (existingWithSameYear) {
      return {
        isValid: false,
        errorMessage: `You already have a payment for ${point.year}`,
      }
    }

    return { isValid: true }
  }

  // Memoized calculations
  const salaryData = useMemo<SalaryDataPoint[]>(
    () => adjustSalaries(payPoints, inflationData),
    [payPoints, inflationData],
  )

  const statistics = useMemo<SalaryStatistics>(() => computeStatistics(salaryData), [salaryData])

  const yearRange = useMemo(() => {
    if (!salaryData.length) {
      // Use currentYear passed from server to avoid runtime Date access
      return { minYear: currentYear - 5, maxYear: currentYear }
    }
    const years = salaryData.map(p => p.year)
    return { minYear: Math.min(...years), maxYear: Math.max(...years) }
  }, [salaryData, currentYear])

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
      y: p.y !== null ? calculateNetIncome(p.x, p.y) : null,
    }))

    const netInflPoints = inflPoints.map<ChartPoint>(p => ({
      x: p.x,
      y: p.y !== null ? calculateNetIncome(p.x, p.y) : null,
    }))

    return {
      actualSeries: actualPoints,
      inflSeries: inflPoints,
      netActualSeries: netActualPoints,
      netInflSeries: netInflPoints,
    }
  }, [payPoints, inflationData, salaryData])

  const hasData = salaryData.length > 0 && !Number.isNaN(statistics.startingPay)

  return {
    // Data
    payPoints,
    inflationData,
    salaryData,

    // Chart data
    chartData,
    yearRange,

    // Statistics
    statistics,
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
