/**
 * SSB Query Functions
 * Low-level functions to query Statistics Norway (SSB) salary data
 * These functions wrap the existing SSB API routes for use by AI tools
 */

type SalarySeriesPoint = {
  year: number
  value: number | null
  type: 'official' | 'estimated'
}

type SalarySeriesResponse = {
  source: { provider: 'SSB'; table: string }
  occupation: { code: string; label?: string }
  unit: 'NOK/month'
  series: SalarySeriesPoint[]
  derived?: { yearlyNok?: SalarySeriesPoint[] }
}

type MedianSalaryResult = {
  monthly: number
  yearly: number
  source: string
  confidence: 'official' | 'estimated'
}

type SalaryTrendResult = {
  series: Array<{ year: number; value: number }>
  totalGrowth: number
  annualGrowth: number
}

type MarketGapResult = {
  medianSalary: number
  difference: {
    absolute: number
    percentage: number
  }
  position: 'significantly above' | 'above' | 'at market' | 'below' | 'significantly below'
}

/**
 * Query median salary for a specific occupation and year
 * Uses SSB Table 11418 with stat=01 (median)
 */
export async function queryMedianSalary(
  occupationCode: string,
  year: number,
): Promise<MedianSalaryResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = new URL(`${baseUrl}/api/ssb/salary`)

  url.searchParams.set('occupation', occupationCode)
  url.searchParams.set('stat', '01') // 01 = median, 02 = average
  url.searchParams.set('fromYear', '2015')

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`SSB query failed: ${response.statusText}`)
  }

  const data: SalarySeriesResponse = await response.json()

  // Find the requested year
  const point = data.series.find(p => p.year === year)
  const yearlyPoint = data.derived?.yearlyNok?.find(p => p.year === year)

  if (!point || !yearlyPoint || point.value === null || yearlyPoint.value === null) {
    throw new Error(`No salary data available for occupation ${occupationCode} in ${year}`)
  }

  return {
    monthly: point.value,
    yearly: yearlyPoint.value,
    source: `SSB Table ${data.source.table}`,
    confidence: point.type,
  }
}

/**
 * Query salary trend over a time range
 * Returns series and growth calculations
 */
export async function querySalaryTrend(
  occupationCode: string,
  fromYear: number,
  toYear: number,
): Promise<SalaryTrendResult> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const url = new URL(`${baseUrl}/api/ssb/salary`)

  url.searchParams.set('occupation', occupationCode)
  url.searchParams.set('stat', '01') // median
  url.searchParams.set('fromYear', fromYear.toString())

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`SSB query failed: ${response.statusText}`)
  }

  const data: SalarySeriesResponse = await response.json()

  // Filter to requested range and get yearly values
  const yearlyData = data.derived?.yearlyNok || []
  const filteredSeries = yearlyData
    .filter(p => p.year >= fromYear && p.year <= toYear && p.value !== null)
    .map(p => ({ year: p.year, value: p.value as number }))

  const firstEntry = filteredSeries[0]
  const lastEntry = filteredSeries[filteredSeries.length - 1]

  if (!firstEntry || !lastEntry) {
    throw new Error(
      `No salary data available for occupation ${occupationCode} in ${fromYear}-${toYear}`,
    )
  }

  // Calculate growth
  const firstValue = firstEntry.value
  const lastValue = lastEntry.value
  const totalGrowth = ((lastValue - firstValue) / firstValue) * 100
  const years = lastEntry.year - firstEntry.year
  const annualGrowth = years > 0 ? totalGrowth / years : 0

  return {
    series: filteredSeries,
    totalGrowth: Math.round(totalGrowth * 10) / 10, // 1 decimal
    annualGrowth: Math.round(annualGrowth * 10) / 10,
  }
}

/**
 * Calculate how a user's salary compares to market median
 * Returns position and gap analysis
 */
export async function calculateMarketGap(
  occupationCode: string,
  userSalary: number,
  year: number,
): Promise<MarketGapResult> {
  const marketData = await queryMedianSalary(occupationCode, year)
  const median = marketData.yearly

  const absolute = userSalary - median
  const percentage = ((userSalary - median) / median) * 100

  // Determine position
  let position: MarketGapResult['position']
  if (percentage > 15) position = 'significantly above'
  else if (percentage > 5) position = 'above'
  else if (percentage < -15) position = 'significantly below'
  else if (percentage < -5) position = 'below'
  else position = 'at market'

  return {
    medianSalary: median,
    difference: {
      absolute: Math.round(absolute),
      percentage: Math.round(percentage * 10) / 10,
    },
    position,
  }
}
