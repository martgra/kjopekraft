import type { PayChangeReason } from '@/domain/salary'
import { TEXT } from './text'

export interface PayReasonMeta {
  value: PayChangeReason
  label: string
  icon: string
  color: string
}

export const PAY_REASON_META: Record<PayChangeReason, PayReasonMeta> = {
  adjustment: { value: 'adjustment', label: TEXT.activity.reasons.adjustment, icon: 'tune',         color: '#4a7fcb' },
  promotion:  { value: 'promotion',  label: TEXT.activity.reasons.promotion,  icon: 'trending_up',  color: '#2a6f3a' },
  newJob:     { value: 'newJob',     label: TEXT.activity.reasons.newJob,     icon: 'work',         color: '#c97a4f' },
}

export const PAY_REASON_OPTIONS: PayReasonMeta[] = [
  PAY_REASON_META.adjustment,
  PAY_REASON_META.promotion,
  PAY_REASON_META.newJob,
]
