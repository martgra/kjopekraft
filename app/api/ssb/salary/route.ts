import { NextRequest, NextResponse } from 'next/server'
import { cacheLife, cacheTag } from 'next/cache'

type SalarySeriesPoint = {
  year: number
  value: number | null
  status?: string | null
  type: 'official' | 'estimated'
  method?: string
  confidence?: 'high' | 'medium' | 'low'
}
type SalarySeriesResponse = {
  source: { provider: 'SSB'; table: '11418' }
  occupation: { code: string; label?: string }
  filters: { contents: string; stat: string; sector: string; sex: string; hours: string }
  unit: 'NOK/month'
  reference: { month: 'November' }
  series: SalarySeriesPoint[]
  derived?: { yearlyNok?: SalarySeriesPoint[] }
  notes?: string[]
}

// Minimal JSON-stat2 typing (enough to parse)
type JsonStat2 = {
  id?: string[]
  size?: number[]
  dimension: Record<
    string,
    {
      category: {
        index?: string[] | Record<string, number>
        label?: Record<string, string>
      }
    }
  >
  value: Array<number | null>
  status?: Array<string | null>
}

function getCategoryKeysInOrder(dim: JsonStat2['dimension'][string]): string[] {
  const idx = dim.category.index

  // JSON-stat2 often provides either an array (ordered keys) or a map (key->position)
  if (Array.isArray(idx)) return idx

  if (idx && typeof idx === 'object') {
    return Object.entries(idx)
      .sort((a, b) => a[1] - b[1])
      .map(([k]) => k)
  }

  // fallback: labels' keys (not guaranteed ordered, but better than nothing)
  return Object.keys(dim.category.label ?? {})
}

function parseSingleTimeSeries(json: JsonStat2, timeDimId = 'Tid'): SalarySeriesPoint[] {
  const tid = json.dimension[timeDimId]
  if (!tid) throw new Error(`Missing time dimension '${timeDimId}' in response`)

  const yearsKeys = getCategoryKeysInOrder(tid)
  const values = json.value
  const statuses = json.status

  // Assumption: all non-time dimensions are fixed to 1 value each → value[] aligns with time.
  if (values.length !== yearsKeys.length) {
    // If this happens, your query returned more than one series (e.g. multiple sectors).
    throw new Error(
      `Expected ${yearsKeys.length} values (one per year), got ${values.length}. ` +
        `Your query likely returns multiple series.`,
    )
  }

  return yearsKeys.map((y, i) => ({
    year: Number(String(y).slice(0, 4)), // safe for "2024" or "2024M11" style codes
    value: values[i] ?? null,
    status: statuses?.[i] ?? null,
    type: 'official' as const,
  }))
}

function buildSsbUrl(params: {
  occupation: string
  contents: string
  stat: string
  sector: string
  sex: string
  hours: string
  fromYear: string
  lang?: 'en' | 'no'
}) {
  const base = 'https://data.ssb.no/api/pxwebapi/v2/tables/11418/data'
  const lang = params.lang ?? 'en'

  // IMPORTANT: SSB API requires parameters in specific order matching dimension order
  // From /metadata: MaaleMetode, Yrke, Sektor, Kjonn, AvtaltVanlig, ContentsCode, Tid
  const qs = new URLSearchParams()
  qs.append('lang', lang)
  qs.append('valueCodes[MaaleMetode]', params.stat)
  qs.append('valueCodes[Yrke]', params.occupation)
  qs.append('valueCodes[Sektor]', params.sector)
  qs.append('valueCodes[Kjonn]', params.sex)
  qs.append('valueCodes[AvtaltVanlig]', params.hours)
  qs.append('valueCodes[ContentsCode]', params.contents)
  qs.append('valueCodes[Tid]', `from(${params.fromYear})`)

  // URLSearchParams encodes '+' as '+' (which becomes space in URLs)
  // We need to replace '+' with '%2B' for SSB API to understand it correctly
  const queryString = qs.toString().replace(/\+/g, '%2B')

  return `${base}?${queryString}`
}

async function fetchSsbSalaryData(params: {
  occupation: string
  contents: string
  stat: string
  sector: string
  sex: string
  hours: string
  fromYear: string
}): Promise<SalarySeriesResponse> {
  const url = buildSsbUrl({ ...params, lang: 'en' })

  console.log('SSB API URL:', url)

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('SSB API Error:', { status: res.status, url, response: text })
    throw new Error(`SSB request failed (${res.status}): ${text}`)
  }

  const json = (await res.json()) as JsonStat2
  const series = parseSingleTimeSeries(json, 'Tid')

  const response: SalarySeriesResponse = {
    source: { provider: 'SSB', table: '11418' },
    occupation: { code: params.occupation },
    filters: {
      contents: params.contents,
      stat: params.stat,
      sector: params.sector,
      sex: params.sex,
      hours: params.hours,
    },
    unit: 'NOK/month',
    reference: { month: 'November' },
    series,
    derived: {
      yearlyNok: series.map(p => ({ ...p, value: p.value == null ? null : p.value * 12 })),
    },
  }

  return response
}

/**
 * Fetch wage index growth from SSB table 11654 to estimate future years
 * Returns growth factor (e.g., 1.044 for 4.4% growth)
 */
async function fetchWageIndexGrowth(
  fromQuarter: string,
  toQuarter: string,
): Promise<number | null> {
  const url = new URL('https://data.ssb.no/api/pxwebapi/v2/tables/11654/data')
  const qs = new URLSearchParams()
  qs.append('lang', 'en')
  qs.append('valueCodes[NACE2007]', '86-88') // Health sector
  qs.append('valueCodes[Region]', 'Ialt') // Total
  qs.append('valueCodes[ContentsCode]', 'GjMdTotalIndeks') // Index of average monthly earnings
  qs.append('valueCodes[Tid]', `${fromQuarter},${toQuarter}`)

  url.search = qs.toString()

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) return null

    const json = (await res.json()) as JsonStat2
    const values = json.value

    if (values.length !== 2 || values[0] === null || values[1] === null) return null

    return values[1] / values[0] // growth factor
  } catch {
    return null
  }
}

/**
 * Estimate 2025 salary using 2024 base and wage index growth
 */
async function estimate2025Salary(
  baseYear2024: SalarySeriesPoint | undefined,
): Promise<SalarySeriesPoint | null> {
  if (!baseYear2024 || baseYear2024.value === null) return null

  // Fetch Q3 2024 → Q3 2025 growth (most recent comparable quarters)
  const growthFactor = await fetchWageIndexGrowth('2024K3', '2025K3')

  if (!growthFactor) return null

  return {
    year: 2025,
    value: Math.round(baseYear2024.value * growthFactor),
    status: null,
    type: 'estimated',
    method: `2024 nurse salary adjusted by SSB wage index (table 11654, health sector, Q3 2024→Q3 2025, +${((growthFactor - 1) * 100).toFixed(1)}%)`,
    confidence: 'medium',
  }
}

/**
 * Cacheable function to fetch SSB salary data with 1-day server-side cache
 * Next.js 16: Uses 'use cache' directive for automatic caching
 * SSB salary data updates annually (November), daily cache ensures we catch updates within 24h
 * See AZURE_CACHE_SETUP.md for production caching strategies
 */
async function getCachedSalaryData(
  occupation: string,
  contents: string,
  stat: string,
  sector: string,
  sex: string,
  hours: string,
  fromYear: string,
): Promise<SalarySeriesResponse> {
  'use cache'
  cacheLife('days') // 1 day cache - catches SSB updates within 24h
  cacheTag('ssb-salary')

  const baseData = await fetchSsbSalaryData({
    occupation,
    contents,
    stat,
    sector,
    sex,
    hours,
    fromYear,
  })

  // Try to add 2025 estimate if not already present
  const has2025 = baseData.series.some(p => p.year === 2025)
  if (!has2025) {
    const year2024 = baseData.series.find(p => p.year === 2024)
    const estimate2025 = await estimate2025Salary(year2024)

    if (estimate2025) {
      baseData.series.push(estimate2025)
      baseData.derived!.yearlyNok!.push({
        ...estimate2025,
        value: estimate2025.value === null ? null : estimate2025.value * 12,
      })
      baseData.notes = [
        '2025 salary is an estimate based on SSB wage index (table 11654, health sector).',
        'SSB advises that wage indices should not be used to calculate exact salary levels.',
      ]
    }
  }

  return baseData
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const occupation = sp.get('occupation') ?? '2223' // Nurses
  const contents = sp.get('contents') ?? 'Manedslonn' // Monthly earnings
  const stat = sp.get('stat') ?? '02' // Average
  const sector = sp.get('sector') ?? 'ALLE' // Sum all sectors
  const sex = sp.get('sex') ?? '0' // Both sexes
  const hours = sp.get('hours') ?? '0' // All employees
  const fromYear = sp.get('fromYear') ?? '2015'

  try {
    const data = await getCachedSalaryData(occupation, contents, stat, sector, sex, hours, fromYear)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch SSB salary data:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch SSB salary data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    )
  }
}
