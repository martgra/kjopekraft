import type { PayChangeReason } from '@/domain/salary'

export interface NegotiationEmailContext {
  salaryHistory?: Array<{
    year: number
    pay: number
    reason?: PayChangeReason
  }>
  purchasingPower?: {
    gapPercent: number | null
    startingYear: number | null
    latestYear: number | null
  }
  referenceSalary?: {
    occupationLabel: string | null
    medianSalary: number | null
    medianYear: number | null
    isApproximate: boolean
  }
}
