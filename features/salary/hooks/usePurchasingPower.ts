'use client'

import { useMemo } from 'react'
import { adjustSalaries, computeStatistics } from '@/domain/salary'
import { calculateNetIncome } from '@/domain/tax'
import type { PayPoint, SalaryDataPoint, SalaryStatistics } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import { usePurchasingPowerBase } from '@/contexts/purchasingPower/PurchasingPowerBaseContext'

interface PurchasingPowerSummary {
  statistics: SalaryStatistics
  salaryData: SalaryDataPoint[]
  baseYearOverride?: number
  net?: {
    statistics: SalaryStatistics
    salaryData: SalaryDataPoint[]
  }
  activeStatistics: SalaryStatistics
}

export function usePurchasingPower(
  payPoints: PayPoint[],
  inflationData: InflationDataPoint[],
  currentYear: number,
  options?: { useNet?: boolean },
): PurchasingPowerSummary {
  const { baseYearOverride } = usePurchasingPowerBase()
  const useNet = options?.useNet ?? false

  const salaryData = useMemo<SalaryDataPoint[]>(
    () => adjustSalaries(payPoints, inflationData, currentYear, baseYearOverride),
    [payPoints, inflationData, currentYear, baseYearOverride],
  )

  const statistics = useMemo<SalaryStatistics>(() => computeStatistics(salaryData), [salaryData])

  const netSalaryData = useMemo<SalaryDataPoint[]>(() => {
    const safeNet = (amount: number, year: number) => {
      try {
        return calculateNetIncome(amount, year)
      } catch {
        return amount
      }
    }
    return salaryData.map(point => ({
      ...point,
      actualPay: safeNet(point.actualPay, point.year),
      inflationAdjustedPay: safeNet(point.inflationAdjustedPay, point.year),
    }))
  }, [salaryData])

  const netStatistics = useMemo<SalaryStatistics>(
    () => computeStatistics(netSalaryData),
    [netSalaryData],
  )

  return {
    statistics,
    salaryData,
    baseYearOverride,
    net: {
      statistics: netStatistics,
      salaryData: netSalaryData,
    },
    activeStatistics: useNet ? netStatistics : statistics,
  }
}
