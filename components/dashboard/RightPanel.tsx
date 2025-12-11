import SalaryPointForm from './SalaryPointForm'
import ActivityTimeline from './ActivityTimeline'
import type { PayPoint } from '@/lib/models/salary'

interface RightPanelProps {
  newYear: string
  newPay: string
  currentYear: number
  minYear: number
  validationError?: string
  isNetMode?: boolean
  payPoints: PayPoint[]
  onYearChange: (yearStr: string) => void
  onPayChange: (payStr: string) => void
  onAdd: () => void
}

export default function RightPanel({
  newYear,
  newPay,
  currentYear,
  minYear,
  validationError,
  isNetMode,
  payPoints,
  onYearChange,
  onPayChange,
  onAdd,
}: RightPanelProps) {
  return (
    <>
      <SalaryPointForm
        newYear={newYear}
        newPay={newPay}
        currentYear={currentYear}
        minYear={minYear}
        validationError={validationError}
        isNetMode={isNetMode}
        onYearChange={onYearChange}
        onPayChange={onPayChange}
        onAdd={onAdd}
      />
      <ActivityTimeline payPoints={payPoints} />
    </>
  )
}
