export type CreditFeature = 'embedding_search' | 'argument_improver' | 'email_generator'

export interface DailyCredits {
  dateKey: string
  used: number
  limit: number
}

export interface CreditSpendResult {
  allowed: boolean
  used: number
  remaining: number
  limit: number
}
