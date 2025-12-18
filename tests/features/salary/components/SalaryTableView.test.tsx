import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SalaryTableView } from '@/features/salary/components/SalaryTableView'
import { TEXT } from '@/lib/constants/text'
import type { SalaryDataPoint, PayPoint } from '@/domain/salary'

const sampleSalaryData: SalaryDataPoint[] = [
  {
    year: 2023,
    actualPay: 400_000,
    inflationAdjustedPay: 380_000,
    inflationRate: 3,
    isInterpolated: false,
  },
  {
    year: 2024,
    actualPay: 500_000,
    inflationAdjustedPay: 420_000,
    inflationRate: 2.5,
    isInterpolated: false,
  },
]

const samplePayPoints: PayPoint[] = [
  { year: 2023, pay: 400_000, reason: 'adjustment' },
  { year: 2024, pay: 500_000, reason: 'newJob' },
]

describe('SalaryTableView', () => {
  it('surfaces purchasing power change in plain language', () => {
    render(
      <SalaryTableView
        salaryData={sampleSalaryData}
        payPoints={samplePayPoints}
        isNetMode={false}
        isLoading={false}
      />,
    )

    expect(
      screen.getAllByText(text => text.includes(TEXT.views.table.purchasingPowerGain))[0],
    ).toBeInTheDocument()
    // With year-over-year calculation:
    // 2024: 500k - (400k * 1.025) = 90k
    // Percent: (90k / 410k) * 100 = 21.95% ≈ 22.0%
    expect(screen.getAllByText(/\+22\.0%/).length).toBeGreaterThan(0)
  })

  it('reveals cumulative growth on expand', async () => {
    const user = userEvent.setup()

    render(
      <SalaryTableView
        salaryData={sampleSalaryData}
        payPoints={samplePayPoints}
        isNetMode={false}
      />,
    )

    const toggle = screen.getAllByRole('button', { name: TEXT.views.table.expandDetails })[0]!
    await user.click(toggle)

    expect(screen.getAllByText(TEXT.views.table.longTermLabel).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Siden 2023/).length).toBeGreaterThan(0)
  })
})
