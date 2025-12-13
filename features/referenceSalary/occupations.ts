/**
 * Registry of supported occupations for reference salary comparison
 * Each occupation can have different business logic/filters in the future
 */

import type { OccupationDefinition } from './types'

export const OCCUPATIONS = {
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
    sector: 'STAT',
  },
  managersMunicipal: {
    code: '1120',
    label: 'Ledere i offentlig sektor (kommune)',
    labelEn: 'Managers in Public Sector (Municipal)',
    sector: 'KOMM',
  },
  managersPrivate: {
    code: '1120',
    label: 'Ledere i privat sektor',
    labelEn: 'Managers in Private Sector',
    sector: 'PRIVAT',
  },
  // Future occupations can be added here with different configurations
  // e.g., specialistNurses, earlyChildhoodTeachers, engineers, etc.
} as const satisfies Record<string, OccupationDefinition>

export type OccupationKey = keyof typeof OCCUPATIONS

export const DEFAULT_OCCUPATION: OccupationKey = 'nurses'
