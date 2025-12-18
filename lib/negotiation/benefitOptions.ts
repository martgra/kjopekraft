import { TEXT } from '@/lib/constants/text'

export const NEGOTIATION_BENEFIT_OPTIONS = [
  { id: 'pension', label: TEXT.negotiationBenefits.items.pension },
  { id: 'bonus', label: TEXT.negotiationBenefits.items.bonus },
  { id: 'equity', label: TEXT.negotiationBenefits.items.equity },
  { id: 'extraVacation', label: TEXT.negotiationBenefits.items.extraVacation },
  { id: 'flexTime', label: TEXT.negotiationBenefits.items.flexTime },
  { id: 'remoteWork', label: TEXT.negotiationBenefits.items.remoteWork },
  { id: 'insurance', label: TEXT.negotiationBenefits.items.insurance },
  { id: 'training', label: TEXT.negotiationBenefits.items.training },
  { id: 'wellness', label: TEXT.negotiationBenefits.items.wellness },
  { id: 'phoneInternet', label: TEXT.negotiationBenefits.items.phoneInternet },
  { id: 'overtime', label: TEXT.negotiationBenefits.items.overtime },
  { id: 'travel', label: TEXT.negotiationBenefits.items.travel },
]

const BENEFIT_LABEL_MAP = new Map(
  NEGOTIATION_BENEFIT_OPTIONS.map(option => [option.id, option.label]),
)

export function formatBenefitLabels(ids: string[]) {
  return ids.map(id => BENEFIT_LABEL_MAP.get(id) ?? id)
}
