/**
 * Registry of supported occupations for reference salary comparison
 * Each occupation can have different business logic/filters in the future
 */

import type { OccupationDefinition } from './types'

export const OCCUPATIONS = {
  stortingsrepresentant: {
    code: 'stortingsrepresentant',
    label: 'Stortingsrepresentant',
    labelEn: 'Member of Parliament',
    provider: 'stortinget',
    availableFromYear: 2001,
  },
  nurses: {
    code: '2223',
    label: 'Sykepleiere',
    labelEn: 'Nurses',
  },
  teachers: {
    code: '2341',
    label: 'Grunnskolelærere',
    labelEn: 'Primary School Teachers',
  },
  managersState: {
    code: '1120',
    label: 'Ledere i offentlig sektor (stat)',
    labelEn: 'Managers in Public Sector (State)',
    sector: '6100', // SSB code for Statsforvaltningen (State)
  },
  managersMunicipal: {
    code: '1120',
    label: 'Ledere i offentlig sektor (kommune)',
    labelEn: 'Managers in Public Sector (Municipal)',
    sector: '6500', // SSB code for Kommuneforvaltningen (Municipal)
  },
  managersPrivate: {
    code: '1120',
    label: 'Ledere i privat sektor',
    labelEn: 'Managers in Private Sector',
    sector: 'A+B+D+E', // SSB code for private sector and publicly owned enterprises
  },
  // Future occupations can be added here with different configurations
  // e.g., specialistNurses, earlyChildhoodTeachers, engineers, etc.
} as const satisfies Record<string, OccupationDefinition>

export type OccupationKey = keyof typeof OCCUPATIONS

export const DEFAULT_OCCUPATION: OccupationKey = 'nurses'

export type ReferenceOccupationSelection = {
  code: string
  label?: string
  provider?: 'ssb' | 'stortinget'
  sector?: string
  availableFromYear?: number
  presetKey?: OccupationKey
}

export function presetOccupationToSelection(key: OccupationKey): ReferenceOccupationSelection {
  const preset = OCCUPATIONS[key]
  return {
    ...preset,
    provider: 'provider' in preset && preset.provider ? preset.provider : 'ssb',
    sector: (preset as { sector?: string }).sector,
    presetKey: key,
  }
}
