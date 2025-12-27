import { OccupationSearchSelect } from '@/components/ui/occupation/OccupationSearchSelect'
import type { OccupationSelection } from '@/lib/ssb/occupationSelection'

export type NegotiationOccupationSelection = OccupationSelection

interface NegotiationMarketSelectorProps {
  selectedOccupation: NegotiationOccupationSelection | null
  onOccupationChange: (value: NegotiationOccupationSelection | null) => void
}

export function NegotiationMarketSelector({
  selectedOccupation,
  onOccupationChange,
}: NegotiationMarketSelectorProps) {
  return (
    <OccupationSearchSelect
      selectedOccupation={selectedOccupation}
      onOccupationChange={onOccupationChange}
      testIdBase="negotiation-market-selector"
      className="mt-3 space-y-2"
      compact
    />
  )
}
