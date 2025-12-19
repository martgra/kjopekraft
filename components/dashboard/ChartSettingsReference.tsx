'use client'

import {
  OccupationSearchSelect,
  type OccupationSelection,
} from '@/components/ui/occupation/OccupationSearchSelect'
import { TEXT } from '@/lib/constants/text'
import { type ReferenceOccupationSelection } from '@/features/referenceSalary/occupations'

interface ChartSettingsReferenceProps {
  selectedOccupation: ReferenceOccupationSelection | null
  onOccupationChange: (value: ReferenceOccupationSelection | null) => void
}

export function ChartSettingsReference({
  selectedOccupation,
  onOccupationChange,
}: ChartSettingsReferenceProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <OccupationSearchSelect
        selectedOccupation={selectedOccupation as OccupationSelection | null}
        onOccupationChange={value => onOccupationChange(value as ReferenceOccupationSelection)}
        testIdBase="chart-settings-reference"
        compact
      />
    </div>
  )
}
