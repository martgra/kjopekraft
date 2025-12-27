'use client'

import { OccupationSearchSelect } from '@/components/ui/occupation/OccupationSearchSelect'
import type { OccupationSelection } from '@/lib/ssb/occupationSelection'

interface ChartSettingsReferenceProps {
  selectedOccupation: OccupationSelection | null
  onOccupationChange: (value: OccupationSelection | null) => void
}

export function ChartSettingsReference({
  selectedOccupation,
  onOccupationChange,
}: ChartSettingsReferenceProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <OccupationSearchSelect
        selectedOccupation={selectedOccupation}
        onOccupationChange={onOccupationChange}
        testIdBase="chart-settings-reference"
        compact
      />
    </div>
  )
}
