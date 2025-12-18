import { TEXT } from '@/lib/constants/text'

export const NEGOTIATION_POINT_TYPES = [
  { value: 'Achievement', label: TEXT.negotiation.typeAchievement },
  { value: 'Responsibility', label: TEXT.negotiation.typeResponsibility },
  { value: 'Market', label: TEXT.negotiation.typeMarket },
  { value: 'Competence', label: TEXT.negotiation.typeCompetence },
  { value: 'Other', label: TEXT.negotiation.typeOther },
]

export const NEGOTIATION_MAX_POINTS = 5

const TYPE_ALIASES: Record<string, string> = {
  Experience: 'Competence',
  Certification: 'Competence',
  Education: 'Competence',
  'Market Data': 'Market',
}

export const NEGOTIATION_POINT_TYPE_LABELS: Record<string, string> = {
  Achievement: TEXT.negotiation.typeAchievement,
  Responsibility: TEXT.negotiation.typeResponsibility,
  Market: TEXT.negotiation.typeMarket,
  Competence: TEXT.negotiation.typeCompetence,
  Other: TEXT.negotiation.typeOther,
}

export function normalizeNegotiationPointType(type: string) {
  return TYPE_ALIASES[type] ?? type
}
