import type { SalaryDataPoint, SalaryInsight, SalaryTableRow } from './salaryTypes'
import type { ReferenceDataPoint } from '@/domain/reference'

type BuildSalaryRowsOptions = {
  salaryData: SalaryDataPoint[]
  referenceData?: ReferenceDataPoint[]
  transformPay?: (value: number, year: number) => number
}

const roundPercent = (value: number | null) => (value === null ? null : Math.round(value * 10) / 10)

const applyTransform = (
  value: number,
  year: number,
  transform?: (value: number, year: number) => number,
) => (transform ? transform(value, year) : value)

export function buildSalaryTableRows({
  salaryData,
  referenceData = [],
  transformPay,
}: BuildSalaryRowsOptions): SalaryTableRow[] {
  if (!salaryData.length) return []

  const sorted = [...salaryData].sort((a, b) => a.year - b.year)
  const referenceByYear = new Map(referenceData.map(point => [point.year, point]))

  const displaySeries = sorted.map(point => ({
    year: point.year,
    salary: applyTransform(point.actualPay, point.year, transformPay),
    inflationAdjusted: applyTransform(point.inflationAdjustedPay, point.year, transformPay),
    inflationRate: point.inflationRate,
    isInterpolated: point.isInterpolated,
  }))

  const baseSalary = displaySeries[0]?.salary ?? 0

  return displaySeries.map((point, index) => {
    const previous = index > 0 ? displaySeries[index - 1] : null
    const yoyAbsoluteChange = previous ? point.salary - previous.salary : null
    const yoyPercentChange =
      previous && previous.salary !== 0
        ? roundPercent((yoyAbsoluteChange! / previous.salary) * 100)
        : null
    const cumulativeChange = point.salary - baseSalary
    const cumulativePercent =
      baseSalary !== 0 ? roundPercent((cumulativeChange / baseSalary) * 100) : null

    const purchasingPowerDelta = point.salary - point.inflationAdjusted
    const purchasingPowerPercent =
      point.inflationAdjusted !== 0
        ? roundPercent((purchasingPowerDelta / point.inflationAdjusted) * 100)
        : null

    const referencePoint = referenceByYear.get(point.year)
    const referenceValue =
      referencePoint && referencePoint.value !== null
        ? applyTransform(referencePoint.value, point.year, transformPay)
        : null
    const referenceGap = referenceValue === null ? null : point.salary - referenceValue
    const referenceGapPercent =
      referenceGap !== null && referenceValue !== null && referenceValue !== 0
        ? roundPercent((referenceGap / referenceValue) * 100)
        : null

    return {
      year: point.year,
      salary: point.salary,
      inflationAdjusted: point.inflationAdjusted,
      inflationRate: point.inflationRate,
      yoyAbsoluteChange,
      yoyPercentChange,
      purchasingPowerDelta,
      purchasingPowerPercent,
      cumulativeChange,
      cumulativePercent,
      isInterpolated: point.isInterpolated,
      reference: referencePoint
        ? {
            value: referenceValue,
            gap: referenceGap,
            gapPercent: referenceGapPercent,
            type: referencePoint.type,
            confidence: referencePoint.confidence,
          }
        : undefined,
    }
  })
}

type BuildSalaryInsightsOptions = BuildSalaryRowsOptions

type LargestRaiseInsight = Extract<SalaryInsight, { kind: 'largestRaise' }>

export function buildSalaryInsights(options: BuildSalaryInsightsOptions): SalaryInsight[] {
  const rows = buildSalaryTableRows(options)
  if (!rows.length) return []

  const insights: SalaryInsight[] = []

  let largestRaise: LargestRaiseInsight | null = null
  rows.forEach(row => {
    if (row.yoyAbsoluteChange === null || row.yoyAbsoluteChange <= 0) return
    if (!largestRaise || row.yoyAbsoluteChange > largestRaise.absoluteChange) {
      largestRaise = {
        kind: 'largestRaise',
        year: row.year,
        absoluteChange: row.yoyAbsoluteChange,
        percentChange: row.yoyPercentChange,
      }
    }
  })
  if (largestRaise) {
    insights.push(largestRaise)
  }

  const bestPowerRow = rows.reduce<SalaryTableRow | null>((best, row) => {
    if (!best || row.purchasingPowerDelta > best.purchasingPowerDelta) return row
    return best
  }, null)
  const worstPowerRow = rows.reduce<SalaryTableRow | null>((worst, row) => {
    if (!worst || row.purchasingPowerDelta < worst.purchasingPowerDelta) return row
    return worst
  }, null)
  if (bestPowerRow) {
    insights.push({
      kind: 'purchasingPowerGain',
      year: bestPowerRow.year,
      delta: bestPowerRow.purchasingPowerDelta,
      percentDelta: bestPowerRow.purchasingPowerPercent,
    })
  }
  if (worstPowerRow) {
    insights.push({
      kind: 'purchasingPowerLoss',
      year: worstPowerRow.year,
      delta: worstPowerRow.purchasingPowerDelta,
      percentDelta: worstPowerRow.purchasingPowerPercent,
    })
  }

  const wins = rows.filter(
    row => row.reference && row.reference.value !== null && (row.reference.gap ?? 0) >= 0,
  )
  if (wins.length) {
    const bestGapRow = wins.reduce<SalaryTableRow | null>((best, row) => {
      if (!best) return row
      const gap = row.reference?.gap ?? -Infinity
      const currentBestGap = best.reference?.gap ?? -Infinity
      return gap > currentBestGap ? row : best
    }, null)

    insights.push({
      kind: 'referenceWins',
      years: wins.map(row => row.year),
      bestGap:
        bestGapRow && bestGapRow.reference?.gap !== null
          ? {
              year: bestGapRow.year,
              gap: bestGapRow.reference?.gap ?? 0,
              gapPercent: bestGapRow.reference?.gapPercent ?? null,
            }
          : undefined,
    })
  }

  const losses = rows.filter(
    row => row.reference && row.reference.value !== null && (row.reference.gap ?? 0) < 0,
  )
  if (losses.length) {
    const worstGapRow = losses.reduce<SalaryTableRow | null>((worst, row) => {
      if (!worst) return row
      const gap = row.reference?.gap ?? 0
      const currentWorstGap = worst.reference?.gap ?? 0
      return gap < currentWorstGap ? row : worst
    }, null)

    insights.push({
      kind: 'referenceLosses',
      years: losses.map(row => row.year),
      worstGap:
        worstGapRow && worstGapRow.reference?.gap !== null
          ? {
              year: worstGapRow.year,
              gap: worstGapRow.reference?.gap ?? 0,
              gapPercent: worstGapRow.reference?.gapPercent ?? null,
            }
          : undefined,
    })
  }

  let bestStreakStart: number | null = null
  let bestStreakEnd: number | null = null
  let bestStreakLength = 0
  let currentStart: number | null = null
  let currentLength = 0
  rows.forEach(row => {
    if (row.purchasingPowerDelta > 0) {
      if (currentStart === null) {
        currentStart = row.year
      }
      currentLength += 1
      if (currentLength > bestStreakLength) {
        bestStreakLength = currentLength
        bestStreakStart = currentStart
        bestStreakEnd = row.year
      }
    } else {
      currentStart = null
      currentLength = 0
    }
  })
  if (bestStreakLength > 0 && bestStreakStart !== null && bestStreakEnd !== null) {
    insights.push({
      kind: 'inflationBeatingStreak',
      startYear: bestStreakStart,
      endYear: bestStreakEnd,
      length: bestStreakLength,
    })
  }

  return insights
}
