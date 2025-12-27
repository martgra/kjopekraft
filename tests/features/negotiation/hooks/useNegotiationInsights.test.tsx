/// <reference types="vitest" />

import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { PurchasingPowerBaseProvider } from '@/contexts/purchasingPower/PurchasingPowerBaseContext'
import { useNegotiationInsights } from '@/features/negotiation/hooks/useNegotiationInsights'
import { NegotiationUserInfoSchema } from '@/lib/schemas/negotiation'
import type { InflationDataPoint } from '@/domain/inflation'
import type { PayPoint } from '@/domain/salary'

const wrapper = ({ children }: { children: ReactNode }) => (
  <PurchasingPowerBaseProvider>{children}</PurchasingPowerBaseProvider>
)

describe('useNegotiationInsights', () => {
  it('derives negotiation insights from salary and market inputs', () => {
    const payPoints: PayPoint[] = [
      { year: 2023, pay: 500_000, reason: 'newJob' },
      { year: 2024, pay: 550_000, reason: 'adjustment' },
    ]
    const inflationData: InflationDataPoint[] = [
      { year: 2023, inflation: 2 },
      { year: 2024, inflation: 3 },
    ]
    const userInfo = NegotiationUserInfoSchema.parse({
      jobTitle: 'Utvikler',
      currentSalary: '550000',
      desiredSalary: '600000',
    })

    const { result } = renderHook(
      () =>
        useNegotiationInsights({
          payPoints,
          inflationData,
          currentYear: 2024,
          userInfo,
          medianSalary: 520_000,
        }),
      { wrapper },
    )

    expect(result.current.hasSalaryHistory).toBe(true)
    expect(result.current.derivedCurrentSalary).toBe('550000')
    expect(result.current.derivedIsNewJob).toBe(false)
    expect(result.current.desiredVsMedianIsAbove).toBe(true)
    expect(result.current.suggestedRange).not.toBeNull()
  })
})
