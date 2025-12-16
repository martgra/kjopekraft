import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBanner from '@/components/dashboard/StatusBanner'
import { computeStatistics, adjustSalaries } from '@/domain/salary/salaryCalculator'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'

describe('StatusBanner Integration with Real Calculations', () => {
  it('shows strong win when salary significantly beats inflation', () => {
    // Scenario: Salary grew 30% but inflation only 20% → 8.3% real gain
    const payPoints: PayPoint[] = [
      { year: 2020, pay: 400000, reason: 'newJob' },
      { year: 2024, pay: 520000, reason: 'adjustment' },
    ]

    const inflation: InflationDataPoint[] = [
      { year: 2020, inflation: 0 },
      { year: 2021, inflation: 3.5 },
      { year: 2022, inflation: 5.8 },
      { year: 2023, inflation: 6.3 },
      { year: 2024, inflation: 4.5 },
    ]

    const series = adjustSalaries(payPoints, inflation)
    const statistics = computeStatistics(series)

    render(<StatusBanner statistics={statistics} />)

    const container = screen.getByTestId('status-banner-container')
    expect(container).toHaveAttribute('data-state', 'strongWin')
    expect(screen.getByText('Du ligger foran inflasjonen')).toBeInTheDocument()
    expect(statistics.gapPercent).toBeGreaterThanOrEqual(5)
  })

  it('shows small win when salary barely beats inflation', () => {
    // Scenario: Salary grew to stay ahead of inflation by 1-4%
    // With ~21% cumulative inflation, need ~490k for small win
    const payPoints: PayPoint[] = [
      { year: 2020, pay: 400000, reason: 'newJob' },
      { year: 2024, pay: 495000, reason: 'adjustment' },
    ]

    const inflation: InflationDataPoint[] = [
      { year: 2020, inflation: 0 },
      { year: 2021, inflation: 3.5 },
      { year: 2022, inflation: 5.8 },
      { year: 2023, inflation: 6.3 },
      { year: 2024, inflation: 4.5 },
    ]

    const series = adjustSalaries(payPoints, inflation)
    const statistics = computeStatistics(series)

    render(<StatusBanner statistics={statistics} />)

    const container = screen.getByTestId('status-banner-container')
    expect(container).toHaveAttribute('data-state', 'smallWin')
    expect(screen.getByText('Du er så vidt foran – foreløpig')).toBeInTheDocument()
    expect(statistics.gapPercent).toBeGreaterThanOrEqual(1)
    expect(statistics.gapPercent).toBeLessThan(5)
  })

  it('shows losing when salary growth lags behind inflation', () => {
    // Scenario: Salary grew but not quite enough to match inflation
    // With ~21% cumulative inflation, 485k gives -0.4% gap (losing but not badly)
    const payPoints: PayPoint[] = [
      { year: 2020, pay: 400000, reason: 'newJob' },
      { year: 2024, pay: 485000, reason: 'adjustment' },
    ]

    const inflation: InflationDataPoint[] = [
      { year: 2020, inflation: 0 },
      { year: 2021, inflation: 3.5 },
      { year: 2022, inflation: 5.8 },
      { year: 2023, inflation: 6.3 },
      { year: 2024, inflation: 4.5 },
    ]

    const series = adjustSalaries(payPoints, inflation)
    const statistics = computeStatistics(series)

    render(<StatusBanner statistics={statistics} />)

    const container = screen.getByTestId('status-banner-container')
    expect(container).toHaveAttribute('data-state', 'losing')
    expect(screen.getByText('Du taper kjøpekraft')).toBeInTheDocument()
    expect(statistics.gapPercent).toBeLessThan(1)
    expect(statistics.gapPercent).toBeGreaterThanOrEqual(-3)
  })

  it('shows losing badly when salary growth significantly lags inflation', () => {
    // Scenario: Salary barely grew but inflation was high
    const payPoints: PayPoint[] = [
      { year: 2020, pay: 400000, reason: 'newJob' },
      { year: 2024, pay: 450000, reason: 'adjustment' },
    ]

    const inflation: InflationDataPoint[] = [
      { year: 2020, inflation: 0 },
      { year: 2021, inflation: 3.5 },
      { year: 2022, inflation: 5.8 },
      { year: 2023, inflation: 6.3 },
      { year: 2024, inflation: 4.5 },
    ]

    const series = adjustSalaries(payPoints, inflation)
    const statistics = computeStatistics(series)

    render(<StatusBanner statistics={statistics} />)

    const container = screen.getByTestId('status-banner-container')
    expect(container).toHaveAttribute('data-state', 'losingBadly')
    expect(screen.getByText('Kjøpekraften din faller')).toBeInTheDocument()
    expect(statistics.gapPercent).toBeLessThan(-3)
  })

  it('correctly calculates purchasing power with no salary growth', () => {
    // Scenario: Salary stayed flat while inflation occurred
    const payPoints: PayPoint[] = [
      { year: 2020, pay: 400000, reason: 'newJob' },
      { year: 2024, pay: 400000, reason: 'adjustment' },
    ]

    const inflation: InflationDataPoint[] = [
      { year: 2020, inflation: 0 },
      { year: 2021, inflation: 3.5 },
      { year: 2022, inflation: 5.8 },
      { year: 2023, inflation: 6.3 },
      { year: 2024, inflation: 4.5 },
    ]

    const series = adjustSalaries(payPoints, inflation)
    const statistics = computeStatistics(series)

    // With ~20% cumulative inflation, no salary growth means ~-16.7% real loss
    expect(statistics.latestPay).toBe(400000)
    expect(statistics.inflationAdjustedPay).toBeGreaterThan(400000)
    expect(statistics.gapPercent).toBeLessThan(0)

    render(<StatusBanner statistics={statistics} />)

    const container = screen.getByTestId('status-banner-container')
    expect(container).toHaveAttribute('data-state', 'losingBadly')
  })

  it('displays correct purchasing power percentage in micro-indicator', () => {
    const payPoints: PayPoint[] = [
      { year: 2020, pay: 400000, reason: 'newJob' },
      { year: 2024, pay: 500000, reason: 'adjustment' },
    ]

    const inflation: InflationDataPoint[] = [
      { year: 2020, inflation: 0 },
      { year: 2021, inflation: 3.5 },
      { year: 2022, inflation: 5.8 },
      { year: 2023, inflation: 6.3 },
      { year: 2024, inflation: 4.5 },
    ]

    const series = adjustSalaries(payPoints, inflation)
    const statistics = computeStatistics(series)

    render(<StatusBanner statistics={statistics} />)

    // Verify the displayed percentage matches the calculated gap
    const percentageText = screen.getByText(
      new RegExp(`${statistics.gapPercent > 0 ? '\\+' : ''}${statistics.gapPercent.toFixed(1)} %`),
    )
    expect(percentageText).toBeInTheDocument()
  })
})
