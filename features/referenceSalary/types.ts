/**
 * Types for reference salary data from SSB and internal calculations
 */

export type ReferenceDataPoint = {
  year: number
  value: number | null // null if provider has missing data (".", "..", ":" etc.)
  status?: string | null // optional status marker from JSON-stat
  type: 'official' | 'estimated' // distinguish official data from estimates
  method?: string // explanation for estimated values
  confidence?: 'high' | 'medium' | 'low'
}

export type ReferenceSource =
  | { provider: 'SSB'; table: '11418' }
  | { provider: 'Stortinget'; table: 'Lonnsutvikling' }

export type ReferenceFilters =
  | {
      contents: string
      stat: string
      sector: string
      sex: string
      hours: string
    }
  | Record<string, string>

export type ReferenceSalaryResponse = {
  source: ReferenceSource
  occupation: { code: string; label?: string }
  filters: ReferenceFilters
  unit: 'NOK/month' | 'NOK/year'
  reference: { month?: 'November'; effectiveFrom?: string }
  series: ReferenceDataPoint[]
  derived?: {
    yearlyNok?: ReferenceDataPoint[] // value*12 when value != null
  }
  notes?: string[] // warnings/caveats about data
}

export type OccupationDefinition = {
  code: string
  label: string
  labelEn?: string
  sector?: string // SSB sector code: 'ALLE' (all), 'STAT' (state), 'KOMM' (municipal), 'PRIVAT' (private)
  provider?: 'ssb' | 'stortinget'
  availableFromYear?: number
}
