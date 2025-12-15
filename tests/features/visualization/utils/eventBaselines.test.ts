/// <reference types="vitest" />

import { calculateEventBaselines } from '@/features/visualization/utils/eventBaselines'
import type { PayPoint } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'

const mockInflationData: InflationDataPoint[] = [
  { year: 2020, inflation: 2 },
  { year: 2021, inflation: 3 },
  { year: 2022, inflation: 5 },
  { year: 2023, inflation: 4 },
  { year: 2024, inflation: 3 },
]

const mockPayPoints: PayPoint[] = [
  { year: 2020, pay: 500000, reason: 'newJob' },
  { year: 2021, pay: 520000, reason: 'adjustment' },
  { year: 2022, pay: 600000, reason: 'promotion' },
  { year: 2023, pay: 650000, reason: 'adjustment' },
  { year: 2024, pay: 680000, reason: 'newJob' },
]

describe('calculateEventBaselines', () => {
  it('returns empty array when no pay points provided', () => {
    const baselines = calculateEventBaselines([], mockInflationData, 2024)
    expect(baselines).toEqual([])
  })

  it('still creates baselines when no inflation data provided (uses factor of 1)', () => {
    const baselines = calculateEventBaselines(mockPayPoints, [], 2024)
    // Should still create baselines for promotion/newJob events (excluding earliest)
    // But with no inflation adjustment (factor = 1)
    expect(baselines.length).toBeGreaterThan(0)

    // All values should remain constant without inflation data
    const firstBaseline = baselines[0]
    if (!firstBaseline) throw new Error('Expected baseline')
    const firstValue = firstBaseline.data[0]?.y
    if (firstValue === undefined) throw new Error('Expected data point')
    firstBaseline.data.forEach(point => {
      expect(point.y).toBe(firstValue) // Should be same value throughout
    })
  })

  it('filters out adjustment points', () => {
    const adjustmentOnlyPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2021, pay: 520000, reason: 'adjustment' },
    ]
    const baselines = calculateEventBaselines(adjustmentOnlyPoints, mockInflationData, 2024)
    expect(baselines).toEqual([])
  })

  it('excludes earliest point even if it is promotion', () => {
    const promotionFirst: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'promotion' }, // Earliest - should be excluded
      { year: 2022, pay: 600000, reason: 'newJob' },
    ]
    const baselines = calculateEventBaselines(promotionFirst, mockInflationData, 2024)

    expect(baselines).toHaveLength(1)
    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    expect(baseline.year).toBe(2022) // Only the newJob, not the earliest promotion
    expect(baseline.reason).toBe('newJob')
  })

  it('excludes earliest point even if it is newJob', () => {
    const newJobFirst: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'newJob' }, // Earliest - should be excluded
      { year: 2022, pay: 600000, reason: 'promotion' },
    ]
    const baselines = calculateEventBaselines(newJobFirst, mockInflationData, 2024)

    expect(baselines).toHaveLength(1)
    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    expect(baseline.year).toBe(2022) // Only the promotion, not the earliest newJob
    expect(baseline.reason).toBe('promotion')
  })

  it('creates baseline for promotion events (not earliest)', () => {
    const points: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' }, // Earliest, not an event
      { year: 2022, pay: 600000, reason: 'promotion' }, // This should create a baseline
    ]
    const baselines = calculateEventBaselines(points, mockInflationData, 2024)

    expect(baselines).toHaveLength(1)
    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    expect(baseline.year).toBe(2022)
    expect(baseline.reason).toBe('promotion')
    expect(baseline.label).toBe('Forfremmelse 2022')
  })

  it('creates baseline for newJob events (not earliest)', () => {
    const points: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2022, pay: 550000, reason: 'newJob' },
    ]
    const baselines = calculateEventBaselines(points, mockInflationData, 2024)

    expect(baselines).toHaveLength(1)
    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    expect(baseline.year).toBe(2022)
    expect(baseline.reason).toBe('newJob')
    expect(baseline.label).toBe('Ny jobb 2022')
  })

  it('creates multiple baselines for multiple events (excluding earliest)', () => {
    const baselines = calculateEventBaselines(mockPayPoints, mockInflationData, 2024)

    // Should have 2 baselines: 1 promotion (2022) + 1 newJob (2024)
    // The earliest point (2020 newJob) is excluded to avoid duplicating the main inflation baseline
    expect(baselines).toHaveLength(2)

    const newJobBaselines = baselines.filter(b => b.reason === 'newJob')
    const promotionBaselines = baselines.filter(b => b.reason === 'promotion')

    expect(newJobBaselines).toHaveLength(1)
    expect(promotionBaselines).toHaveLength(1)
  })

  it('generates data points from event year to end year', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2022, pay: 600000, reason: 'promotion' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024)

    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    expect(baseline.data).toHaveLength(3) // 2022, 2023, 2024

    expect(baseline.data[0]?.x).toBe(2022)
    expect(baseline.data[1]?.x).toBe(2023)
    expect(baseline.data[2]?.x).toBe(2024)
  })

  it('applies inflation correctly from event start year', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 400000, reason: 'adjustment' },
      { year: 2022, pay: 600000, reason: 'promotion' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024, false)

    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')

    // 2022: 600000 * 1.0 = 600000 (base year)
    expect(baseline.data[0]?.y).toBe(600000)

    // 2023: 600000 * (1 + 0.04) = 624000
    // Uses inflation from 2023 (4%), not from 2020
    expect(baseline.data[1]?.y).toBeCloseTo(624000, -2)

    // 2024: 600000 * (1.04) * (1.03) = 642720
    // Uses inflation from 2023 (4%) and 2024 (3%)
    expect(baseline.data[2]?.y).toBeCloseTo(642720, -2)
  })

  it('calculates gross values when displayNet is false', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2022, pay: 600000, reason: 'promotion' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024, false)

    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    // First point should be the original gross value
    expect(baseline.data[0]?.y).toBe(600000)
  })

  it('calculates net values when displayNet is true', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2022, pay: 600000, reason: 'promotion' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024, true)

    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    // Should apply net income calculation
    // Net values will be lower than gross
    const firstValue = baseline.data[0]?.y
    if (firstValue === undefined) throw new Error('Expected data point')
    expect(firstValue).toBeLessThan(600000)
  })

  it('handles events in the same year independently (if not earliest)', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2022, pay: 600000, reason: 'promotion' },
      { year: 2022, pay: 550000, reason: 'newJob' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024)

    expect(baselines).toHaveLength(2)
    expect(baselines[0]?.data[0]?.y).toBe(600000)
    expect(baselines[1]?.data[0]?.y).toBe(550000)
  })

  it('maintains chronological order of events (excluding earliest)', () => {
    const baselines = calculateEventBaselines(mockPayPoints, mockInflationData, 2024)

    // 2020 newJob is excluded as it's the earliest point
    expect(baselines[0]?.year).toBe(2022) // promotion
    expect(baselines[1]?.year).toBe(2024) // newJob
  })

  it('generates correct labels for Norwegian locale', () => {
    const eventPoints: PayPoint[] = [
      { year: 2019, pay: 450000, reason: 'adjustment' },
      { year: 2020, pay: 500000, reason: 'promotion' },
      { year: 2021, pay: 600000, reason: 'newJob' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024)

    // 2019 is earliest, so baselines start from 2020
    expect(baselines[0]?.label).toBe('Forfremmelse 2020')
    expect(baselines[1]?.label).toBe('Ny jobb 2021')
  })

  it('handles endYear same as event year (if not earliest)', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2024, pay: 680000, reason: 'newJob' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024)

    expect(baselines).toHaveLength(1)
    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    expect(baseline.data).toHaveLength(1)
    expect(baseline.data[0]?.x).toBe(2024)
    expect(baseline.data[0]?.y).toBe(680000)
  })

  it('rounds inflated values to integers', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'adjustment' },
      { year: 2022, pay: 600000, reason: 'promotion' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024, false)

    const baseline = baselines[0]
    if (!baseline) throw new Error('Expected baseline')
    baseline.data.forEach(point => {
      expect(Number.isInteger(point.y)).toBe(true)
    })
  })

  it('returns empty array if only earliest point is an event', () => {
    const eventPoints: PayPoint[] = [
      { year: 2020, pay: 500000, reason: 'promotion' }, // Only point, so earliest
      { year: 2021, pay: 520000, reason: 'adjustment' },
      { year: 2022, pay: 550000, reason: 'adjustment' },
    ]
    const baselines = calculateEventBaselines(eventPoints, mockInflationData, 2024)

    // Should be empty because the only event (2020 promotion) is the earliest point
    expect(baselines).toHaveLength(0)
  })
})
