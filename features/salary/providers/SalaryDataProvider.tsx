'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'

interface SalaryDataContextValue {
  payPoints: ReturnType<typeof useSalaryData>['payPoints']
  addPoint: ReturnType<typeof useSalaryData>['addPoint']
  editPoint: ReturnType<typeof useSalaryData>['editPoint']
  removePoint: ReturnType<typeof useSalaryData>['removePoint']
  validatePoint: ReturnType<typeof useSalaryData>['validatePoint']
  chartData: ReturnType<typeof useSalaryData>['chartData']
  yearRange: ReturnType<typeof useSalaryData>['yearRange']
  hasData: boolean
  isLoading: boolean
  error: string | null
}

const SalaryDataContext = createContext<SalaryDataContextValue | undefined>(undefined)

interface SalaryDataProviderProps {
  inflationData: InflationDataPoint[]
  currentYear: number
  children: ReactNode
}

export function SalaryDataProvider({
  inflationData,
  currentYear,
  children,
}: SalaryDataProviderProps) {
  const salaryData = useSalaryData(inflationData, currentYear)

  const value = useMemo<SalaryDataContextValue>(
    () => ({
      payPoints: salaryData.payPoints,
      addPoint: salaryData.addPoint,
      editPoint: salaryData.editPoint,
      removePoint: salaryData.removePoint,
      validatePoint: salaryData.validatePoint,
      chartData: salaryData.chartData,
      yearRange: salaryData.yearRange,
      hasData: salaryData.hasData,
      isLoading: salaryData.isLoading,
      error: salaryData.error,
    }),
    [
      salaryData.payPoints,
      salaryData.addPoint,
      salaryData.editPoint,
      salaryData.removePoint,
      salaryData.validatePoint,
      salaryData.chartData,
      salaryData.yearRange,
      salaryData.hasData,
      salaryData.isLoading,
      salaryData.error,
    ],
  )

  return <SalaryDataContext.Provider value={value}>{children}</SalaryDataContext.Provider>
}

export function useSalaryDataContext() {
  const ctx = useContext(SalaryDataContext)
  if (!ctx) throw new Error('useSalaryDataContext must be used within a SalaryDataProvider')
  return ctx
}
