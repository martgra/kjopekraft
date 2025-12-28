'use client'

import { OccupationSearchSelect } from '@/components/ui/occupation/OccupationSearchSelect'
import { Panel, Notice } from '@/components/ui/atoms'
import type { OccupationSelection } from '@/lib/ssb/occupationSelection'

interface ChartSettingsReferenceProps {
  selectedOccupation: OccupationSelection | null
  onOccupationChange: (value: OccupationSelection | null) => void
  alertMessage?: string
  errorMessage?: string | null
}

export function ChartSettingsReference({
  selectedOccupation,
  onOccupationChange,
  alertMessage,
  errorMessage,
}: ChartSettingsReferenceProps) {
  return (
    <Panel padding="sm" className="rounded-2xl">
      {alertMessage ? <Notice className="mb-3">{alertMessage}</Notice> : null}
      {errorMessage ? (
        <Notice variant="error" className="mb-3">
          {errorMessage}
        </Notice>
      ) : null}
      <OccupationSearchSelect
        selectedOccupation={selectedOccupation}
        onOccupationChange={onOccupationChange}
        testIdBase="chart-settings-reference"
        compact
      />
    </Panel>
  )
}
