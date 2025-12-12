/**
 * Types for reference salary data from SSB and internal calculations
 */

export type ReferenceDataPoint = {
  year: number
  value: number | null // null if SSB has missing data (".", "..", ":" etc.)
  status?: string | null // optional status marker from JSON-stat
  type: 'official' | 'estimated' // distinguish official SSB data from estimates
  method?: string // explanation for estimated values
  confidence?: 'high' | 'medium' | 'low'
}

export type ReferenceSalaryResponse = {
  source: { provider: 'SSB'; table: '11418' }
  occupation: { code: string; label?: string }
  filters: {
    contents: string
    stat: string
    sector: string
    sex: string
    hours: string
  }
  unit: 'NOK/month'
  reference: { month: 'November' }
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
}
