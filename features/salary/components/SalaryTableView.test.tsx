import { render, within } from '@testing-library/react'
import { SalaryTableView } from './SalaryTableView'
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
  it('shows inflation comparison vs previous year inside the change column', () => {
    const { container } = render(
      <SalaryTableView
        salaryData={sampleSalaryData}
        payPoints={samplePayPoints}
        isNetMode={false}
        isLoading={false}
      />,
    )

    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBe(2)

    const latestRow = rows[0]
    expect(latestRow).toHaveTextContent(TEXT.views.table.inflationVsPrev)
    // 2024 salary 500k vs 2023 inflation-adjusted 380k => +120k / +31.6%
    expect(latestRow).toHaveTextContent(/\+120\s?000\s?kr/)
    expect(latestRow).toHaveTextContent(/\+31\.6%/)
  })

  it('hides inflation comparison when there is no previous year', () => {
    const { container } = render(
      <SalaryTableView
        salaryData={sampleSalaryData}
        payPoints={samplePayPoints}
        isNetMode={false}
      />,
    )

    const rows = container.querySelectorAll('tbody tr')
    expect(rows.length).toBeGreaterThan(1)
    const earliestRow = rows[1] as HTMLElement
    expect(within(earliestRow).queryByText(TEXT.views.table.inflationVsPrev)).toBeNull()
  })
})
