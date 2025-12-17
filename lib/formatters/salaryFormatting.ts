import { TEXT } from '@/lib/constants/text'
import type { PayPoint } from '@/domain/salary'

export const formatCurrency = (value: number | null) =>
  value === null ? TEXT.common.noData : Math.round(value).toLocaleString('nb-NO')

export const formatCurrencyWithUnit = (value: number | null) =>
  value === null ? TEXT.common.noData : `${formatCurrency(value)} ${TEXT.common.pts}`

export const formatPercent = (value: number | null) =>
  value === null ? '' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

export const formatSignedCurrency = (value: number | null) =>
  value === null ? TEXT.common.noData : `${value >= 0 ? '+' : ''}${formatCurrency(value)}`

export const formatDate = (year: number) => String(year)

export const formatRelativeYear = (year: number) => {
  const currentYear = new Date().getFullYear()
  const diff = currentYear - year
  if (diff === 0) return TEXT.activity.thisYear
  if (diff === 1) return TEXT.activity.lastYear
  return TEXT.activity.yearsAgo(diff)
}

export const reasonToLabel = (reason: PayPoint['reason'] | undefined) =>
  reason ? TEXT.activity.reasons[reason] : ''

export const reasonVariant = (reason: PayPoint['reason'] | undefined) => {
  if (reason === 'newJob') return 'info'
  if (reason === 'promotion') return 'primary'
  if (reason === 'adjustment') return 'default'
  return 'default'
}

export const purchasingPowerCopy = (delta: number) => {
  if (delta === 0) return TEXT.views.table.purchasingPowerFlat
  const baseText =
    delta > 0 ? TEXT.views.table.purchasingPowerGain : TEXT.views.table.purchasingPowerLoss
  return baseText
}

export const purchasingPowerSymbol = (delta: number) => {
  if (delta === 0) return 'trending_flat'
  const baseText = delta > 0 ? 'trending_up' : 'trending_down'
  return `${baseText}`
}

export const longTermSummary = (
  baselineYear: number | null,
  change: number,
  percent: number | null,
) => {
  if (baselineYear === null) return TEXT.common.noData
  const percentText = formatPercent(percent)
  return `${TEXT.views.table.longTermSince(baselineYear)}: ${formatSignedCurrency(change)} ${TEXT.common.pts}${percentText ? ` (${percentText})` : ''}`
}
