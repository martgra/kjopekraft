import type { PayPoint, SalaryStatistics } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { NegotiationOccupationSelection } from '../NegotiationMarketSelector'

export type ScenarioId = 'conservative' | 'target' | 'stretch'

export type Scenario = {
  id: ScenarioId
  label: string
  sublabel: string
  pct: number
  kr: number | null
  rationale: string
  confidence: string
  confidenceCopy: string
  locked?: boolean
}

export type NegotiationArg = {
  id: string
  title: string
  body: string
  impact: 'Sterk' | 'Middels' | 'Avgjørende'
  icon: string
  selected: boolean
  source: string
  isCustom?: boolean
}

export interface NegotiationWizardProps {
  payPoints: PayPoint[]
  inflationData: InflationDataPoint[]
  statistics: SalaryStatistics | null
  medianSalary: number | null
  medianYear: number | null
  occupationLabel: string | null
  isMedianLoading: boolean
  selectedOccupation: NegotiationOccupationSelection | null
  onOccupationChange: (occ: NegotiationOccupationSelection | null) => void
  inflationGapPercent: number | null
  emailContent: string
  isGeneratingEmail: boolean
  emailError: string | null
  onGenerateEmail: () => void
  currentYear: number
  userJobTitle: string
  userEmployer: string
  userName: string
}
