export type OccupationSelection = {
  code: string
  label?: string
  provider?: 'ssb' | 'stortinget'
  sector?: string
  availableFromYear?: number
}
