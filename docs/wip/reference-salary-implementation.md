# Reference Salary Implementation Guide

## Overview

This document details how the reference salary feature works, specifically for nurses (SSB occupation code 2223). Use this as a blueprint for adding additional occupations.

---

## Architecture

### Data Flow

```
User enables toggle
    ↓
useReferenceSalary hook (client)
    ↓
/api/ssb/salary?occupation=2223&fromYear=2015
    ↓
fetchSsbSalaryData() → SSB table 11418 (official 2015-2024)
    ↓
estimate2025Salary() → SSB table 11654 (wage index)
    ↓
Return combined series with type markers
    ↓
usePaypointChartData transforms to chart format
    ↓
Chart renders amber reference line
```

### File Structure

```
features/referenceSalary/
├── types.ts                    # Type definitions with official/estimated markers
├── occupations.ts              # Registry of supported occupations
├── referenceCalculator.ts      # Business logic for filtering/transforming
└── hooks/
    └── useReferenceSalary.ts   # Client-side data fetching (SWR)

app/api/ssb/salary/
└── route.ts                    # Server-side SSB API integration

contexts/referenceMode/
└── ReferenceModeContext.tsx    # Toggle state management

components/dashboard/
└── ChartSection.tsx            # UI with toggle checkbox
```

---

## Step 1: Fetch Official Salary Data (2015-2024)

### SSB Table 11418 - Monthly Earnings by Occupation

**API Endpoint:**

```
https://data.ssb.no/api/pxwebapi/v2/tables/11418/data
```

**Required Parameters (in order):**

| Parameter                  | Value        | Description                       |
| -------------------------- | ------------ | --------------------------------- |
| `lang`                     | `en`         | Language                          |
| `valueCodes[MaaleMetode]`  | `02`         | Measuring method = Average        |
| `valueCodes[Yrke]`         | `2223`       | Occupation code = Nurses          |
| `valueCodes[Sektor]`       | `ALLE`       | Sector = Sum all sectors          |
| `valueCodes[Kjonn]`        | `0`          | Gender = Both sexes               |
| `valueCodes[AvtaltVanlig]` | `0`          | Working hours = All employees     |
| `valueCodes[ContentsCode]` | `Manedslonn` | Contents = Monthly earnings (NOK) |
| `valueCodes[Tid]`          | `from(2015)` | Time = From 2015 onwards          |

**CRITICAL:** Parameters MUST be in this exact order. SSB API rejects requests with incorrect parameter ordering.

**Example Request:**

```bash
curl 'https://data.ssb.no/api/pxwebapi/v2/tables/11418/data?lang=en&valueCodes%5BMaaleMetode%5D=02&valueCodes%5BYrke%5D=2223&valueCodes%5BSektor%5D=ALLE&valueCodes%5BKjonn%5D=0&valueCodes%5BAvtaltVanlig%5D=0&valueCodes%5BContentsCode%5D=Manedslonn&valueCodes%5BTid%5D=from%282015%29'
```

**Example Response Structure:**

```json
{
  "dimension": {
    "Tid": {
      "category": {
        "index": {"2015": 0, "2016": 1, ..., "2024": 9}
      }
    }
  },
  "value": [41130, 42130, 43320, 44730, 46690, 47020, 49440, 51020, 53880, 56710]
}
```

**Data Points (2015-2024):**

- 2015: 41,130 NOK/month
- 2016: 42,130 NOK/month
- 2017: 43,320 NOK/month
- 2018: 44,730 NOK/month
- 2019: 46,690 NOK/month
- 2020: 47,020 NOK/month
- 2021: 49,440 NOK/month
- 2022: 51,020 NOK/month
- 2023: 53,880 NOK/month
- 2024: 56,710 NOK/month ← **Base for 2025 estimate**

---

## Step 2: Estimate 2025 Using Wage Index

### Why Estimate?

SSB publishes occupation-level salary data with a delay (currently only through 2024). However, they publish wage indices quarterly with much shorter delays. We can use the wage index growth rate to estimate 2025 salary.

**SSB Caveat:** Wage indices are intended to measure changes over time and should not be used to calculate exact salary levels. Therefore we:

1. Clearly mark the estimate as `type: "estimated"`
2. Include methodology in the response
3. Show visual distinction in the chart (lighter/dashed)

### SSB Table 11654 - Wage Index

**API Endpoint:**

```
https://data.ssb.no/api/pxwebapi/v2/tables/11654/data
```

**Parameters for Health Sector Wage Index:**

| Parameter                  | Value             | Description                                      |
| -------------------------- | ----------------- | ------------------------------------------------ |
| `lang`                     | `en`              | Language                                         |
| `valueCodes[NACE2007]`     | `86-88`           | Sector = Human health and social work activities |
| `valueCodes[Region]`       | `Ialt`            | Region = Total (all Norway)                      |
| `valueCodes[ContentsCode]` | `GjMdTotalIndeks` | Index of average monthly earnings                |
| `valueCodes[Tid]`          | `2024K3,2025K3`   | Quarters = Q3 2024 and Q3 2025                   |

**Why Health Sector (86-88)?**
Nurses work primarily in the health sector. Using the sector-specific index provides more accurate growth rates than the total economy index.

**Why Q3 to Q3?**

- Most recent full quarter available
- Year-over-year comparison eliminates seasonal effects
- Q3 is mid-year, representative

**Example Request:**

```bash
curl 'https://data.ssb.no/api/pxwebapi/v2/tables/11654/data?lang=en&valueCodes%5BNACE2007%5D=86-88&valueCodes%5BRegion%5D=Ialt&valueCodes%5BContentsCode%5D=GjMdTotalIndeks&valueCodes%5BTid%5D=2024K3,2025K3'
```

**Example Response:**

```json
{
  "dimension": {
    "Tid": {
      "category": {
        "label": { "2024K3": "2024K3", "2025K3": "2025K3" }
      }
    }
  },
  "value": [99.7, 104.1]
}
```

**Calculation:**

```javascript
growthFactor = 104.1 / 99.7 = 1.0441 (4.41% growth)
estimated2025 = 56710 * 1.0441 = 59,211 NOK/month (rounded to 59,210)
```

## Step 3: Code Implementation

### A. Type Definitions (`domain/reference/referenceTypes.ts`)

```typescript
export type ReferenceDataPoint = {
  year: number
  value: number | null
  status?: string | null
  type: 'official' | 'estimated' // ← Key distinction
  method?: string // ← Explanation for estimates
  confidence?: 'high' | 'medium' | 'low'
}

export type ReferenceSalaryResponse = {
  source: { provider: 'SSB'; table: '11418' }
  occupation: { code: string; label?: string }
  filters: {
    /* ... */
  }
  unit: 'NOK/month'
  reference: { month: 'November' }
  series: ReferenceDataPoint[]
  derived?: {
    yearlyNok?: ReferenceDataPoint[]
  }
  notes?: string[] // ← Disclaimers about estimates
}
```

### B. API Route (`app/api/ssb/salary/route.ts`)

#### B1. Build SSB URL with Correct Parameter Order

```typescript
function buildSsbUrl(params: { /* ... */ }) {
  const base = 'https://data.ssb.no/api/pxwebapi/v2/tables/11418/data'
  const qs = new URLSearchParams()

  // CRITICAL: Order matters!
  qs.append('lang', 'en')
  qs.append('valueCodes[MaaleMetode]', params.stat) // 02
  qs.append('valueCodes[Yrke]', params.occupation) // 2223
  qs.append('valueCodes[Sektor]', params.sector) // ALLE
  qs.append('valueCodes[Kjonn]', params.sex) // 0
  qs.append('valueCodes[AvtaltVanlig]', params.hours) // 0
  qs.append('valueCodes[ContentsCode]', params.contents) // Manedslonn
  qs.append('valueCodes[Tid]', `from(${params.fromYear})`)

  return `${base}?${qs.toString()}`
}
```

#### B2. Parse JSON-stat2 Response

```typescript
function parseSingleTimeSeries(json: JsonStat2, timeDimId = 'Tid'): SalarySeriesPoint[] {
  const tid = json.dimension[timeDimId]
  const yearsKeys = getCategoryKeysInOrder(tid)
  const values = json.value
  const statuses = json.status

  return yearsKeys.map((y, i) => ({
    year: Number(String(y).slice(0, 4)),
    value: values[i] ?? null,
    status: statuses?.[i] ?? null,
    type: 'official' as const, // ← All SSB data marked official
  }))
}
```

#### B3. Fetch Wage Index Growth

```typescript
async function fetchWageIndexGrowth(
  fromQuarter: string, // "2024K3"
  toQuarter: string, // "2025K3"
): Promise<number | null> {
  const url = new URL('https://data.ssb.no/api/pxwebapi/v2/tables/11654/data')
  const qs = new URLSearchParams()

  qs.append('lang', 'en')
  qs.append('valueCodes[NACE2007]', '86-88') // Health sector
  qs.append('valueCodes[Region]', 'Ialt') // Total
  qs.append('valueCodes[ContentsCode]', 'GjMdTotalIndeks') // Wage index
  qs.append('valueCodes[Tid]', `${fromQuarter},${toQuarter}`)

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const json = (await res.json()) as JsonStat2
  const values = json.value

  if (values.length !== 2 || !values[0] || !values[1]) return null

  return values[1] / values[0] // Growth factor
}
```

#### B4. Estimate 2025 Salary

```typescript
async function estimate2025Salary(
  baseYear2024: SalarySeriesPoint | undefined,
): Promise<SalarySeriesPoint | null> {
  if (!baseYear2024 || baseYear2024.value === null) return null

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
```

#### B5. Server-Side Caching (Next.js 16)

**Next.js 16**: Use the `"use cache"` directive for function-level caching instead of `unstable_cache`.

```typescript
import { cacheLife, cacheTag } from 'next/cache'

/**
 * Cacheable function with 1h server-side cache shared across all users
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
  'use cache' // ← Next.js 16 caching directive
  cacheLife('hours') // ← 1 hour cache duration
  cacheTag('ssb-salary') // ← Tag for on-demand invalidation

  const baseData = await fetchSsbSalaryData({
    occupation,
    contents,
    stat,
    sector,
    sex,
    hours,
    fromYear,
  })

  // Add 2025 estimate if not already present
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
```

#### B6. GET Handler

```typescript
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams

  const occupation = sp.get('occupation') ?? '2223'
  const contents = sp.get('contents') ?? 'Manedslonn'
  const stat = sp.get('stat') ?? '02'
  const sector = sp.get('sector') ?? 'ALLE'
  const sex = sp.get('sex') ?? '0'
  const hours = sp.get('hours') ?? '0'
  const fromYear = sp.get('fromYear') ?? '2015'

  try {
    // Cache automatically shared across all client connections
    const data = await getCachedSalaryData(occupation, contents, stat, sector, sex, hours, fromYear)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch SSB salary data:', error)
    return NextResponse.json({ error: 'Failed to fetch SSB salary data' }, { status: 502 })
  }
}
```

**Key Benefits of `"use cache"`:**

- Automatic cache key generation based on function arguments
- Cache shared across all users (no duplicate SSB API calls)
- On-demand invalidation via `updateTag("ssb-salary")`
- Works seamlessly with Next.js 16 App Router
- No need to manually manage cache keys

---

## Step 4: Client-Side Data Flow

### A. Hook (`features/referenceSalary/hooks/useReferenceSalary.ts`)

```typescript
export function useReferenceSalary(options: UseReferenceSalaryOptions = {}) {
  const { occupation = DEFAULT_OCCUPATION, fromYear = 2015, enabled = true } = options

  // Map occupation key to SSB code
  const occupationCode = OCCUPATIONS[occupation].code // "2223" for nurses

  const { data, error, isLoading } = useSWR<ReferenceSalaryResponse>(
    enabled ? `/api/ssb/salary?occupation=${occupationCode}&fromYear=${fromYear}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      dedupingInterval: 86400000, // 24h client cache
    },
  )

  // Extract yearly series (API returns monthly × 12)
  const yearlyData: ReferenceDataPoint[] = data?.derived?.yearlyNok ?? []

  return { data: yearlyData, isLoading, error, metadata: data }
}
```

### B. Chart Data Transformation (`features/salary/hooks/usePaypointChartData.ts`)

```typescript
export function usePaypointChartData(payPoints: PayPoint[], inflationData: InflationDataPoint[]) {
  const { isReferenceEnabled } = useReferenceMode()
  const { isNetMode } = useDisplayMode()

  // Fetch reference data only when toggle enabled
  const { data: referenceData } = useReferenceSalary({
    occupation: 'nurses',
    fromYear: 2015,
    enabled: isReferenceEnabled,
  })

  // Filter to user's year range and apply net/gross transformation
  const referenceSeries: ScatterDataPoint[] =
    isReferenceEnabled && referenceData.length > 0 && yearRange
      ? filterReferenceByYearRange(referenceData, yearRange.minYear, yearRange.maxYear).map(
          point => ({
            x: point.year,
            y:
              point.value === null
                ? null
                : isNetMode
                  ? calculateNetIncome(point.year, point.value)
                  : point.value,
          }),
        )
      : []

  return { actualSeries, inflSeries, referenceSeries, yearRange }
}
```

---

## Step 5: Visual Rendering

### Chart Configuration

**Desktop/Mobile Charts:**

```typescript
{
  label: TEXT.referenceSalary.chartLabel,  // "Referanse (Sykepleiere)"
  data: referenceSeries,
  tension: 0.4,
  fill: false,
  backgroundColor: 'transparent',
  borderColor: '#f59e0b',        // Amber (distinct from blue/green)
  borderWidth: 2,
  pointRadius: 4,
  borderDash: [3, 3],            // Dashed to indicate reference/estimated
  spanGaps: true,
}
```

**Visual Hierarchy:**

1. **Blue solid** = User's actual salary (primary)
2. **Green dashed** = Inflation-adjusted baseline (secondary)
3. **Amber dashed** = Reference salary (optional/contextual)

---

## Expanding to Other Occupations

### 1. Find SSB Occupation Code

Visit SSB table 11418 and search for the occupation:

- https://www.ssb.no/statbank/table/11418

Or query metadata:

```bash
curl -s "https://data.ssb.no/api/pxwebapi/v2/tables/11418/metadata?lang=en" | \
  jq '.dimension.Yrke.category.label | to_entries[] | select(.value | test("teacher"; "i"))'
```

### 2. Determine Appropriate NACE Sector for Wage Index

| Occupation          | SSB Code | NACE Sector                            | Code      |
| ------------------- | -------- | -------------------------------------- | --------- |
| Nurses              | 2223     | Human health and social work           | 86-88     |
| Teachers            | 233X     | Education                              | P (85)    |
| Software developers | 2512     | Information and communication          | J (62-63) |
| Engineers           | 214X     | Professional, scientific and technical | M (71-74) |

Check available NACE codes:

```bash
curl -s "https://data.ssb.no/api/pxwebapi/v2/tables/11654/metadata?lang=en" | \
  jq '.dimension.NACE2007.category.label'
```

### 3. Add to Occupations Registry

`features/referenceSalary/occupations.ts`:

```typescript
export const OCCUPATIONS = {
  nurses: {
    code: '2223',
    label: 'Sykepleiere',
    labelEn: 'Nurses',
    naceCode: '86-88', // ← Add this
  },
  teachers: {
    code: '2330',
    label: 'Lærere',
    labelEn: 'Teachers',
    naceCode: 'P',
  },
  // ... more occupations
} as const
```

### 4. Update Estimation Function (if needed)

If different occupations require different NACE sectors for wage index:

```typescript
async function estimate2025Salary(
  baseYear2024: SalarySeriesPoint | undefined,
  naceCode: string, // ← Pass sector dynamically
): Promise<SalarySeriesPoint | null> {
  // ... update fetchWageIndexGrowth to accept naceCode parameter
}
```

### 5. Update UI Text

Add occupation-specific labels in `lib/constants/text.ts`.

---

## Testing Checklist

- [ ] API returns 2015-2024 official data
- [ ] API returns 2025 estimate with `type: "estimated"`
- [ ] Estimate includes `method` explaining calculation
- [ ] Response includes `notes` with disclaimers
- [ ] Toggle shows/hides reference line
- [ ] Reference line respects net/gross mode
- [ ] Reference filters to user's year range
- [ ] Badge shows "Referanse aktiv" when enabled
- [ ] Chart renders amber dashed line
- [ ] Data cached server-side (24h)
- [ ] No errors when SSB API unavailable (graceful degradation)

---

## Known Limitations

1. **SSB Data Delay**: Official occupation salaries lag by ~1 year
2. **Estimation Accuracy**: Wage index is sector-wide, not occupation-specific
3. **Sector Assumptions**: Some occupations span multiple sectors (use dominant sector)
4. **Regional Variation**: Using national totals (no regional breakdowns)
5. **2025 Only**: Current implementation only estimates one year ahead

---

## Future Enhancements

1. **Multi-year estimation**: Extend to 2026+ using forecasted wage growth
2. **Regional support**: Add region parameter for local comparisons
3. **Occupation picker**: UI to select from multiple occupations
4. **Confidence intervals**: Show range of estimates instead of point estimate
5. **Trend analysis**: Compare user's growth vs reference growth
6. **Sector switching**: Allow users to choose sector for wage index

---

## References

- **SSB Table 11418**: https://www.ssb.no/statbank/table/11418 (Monthly earnings by occupation)
- **SSB Table 11654**: https://www.ssb.no/statbank/table/11654 (Wage index)
- **PxWebApi v2 User Guide**: https://www.ssb.no/en/api/statbank-pxwebapi-user-guide
- **NACE Classification**: https://www.ssb.no/en/klass/klassifikasjoner/6 (Sector codes)
- **STYRK08 Classification**: https://www.ssb.no/klass/klassifikasjoner/7 (Occupation codes)

---

_Last updated: December 12, 2025_

**Next.js Version:** 16.0.9 with `cacheComponents: true` enabled for `"use cache"` directive support.
