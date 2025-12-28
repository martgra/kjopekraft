import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CREDIT_COSTS,
  DEFAULT_DAILY_LIMIT,
  getLocalDateKey,
  getRemainingCredits,
} from '@/domain/credits/creditsPolicy'

describe('creditsPolicy', () => {
  it('exposes expected defaults', () => {
    expect(DEFAULT_DAILY_LIMIT).toBeGreaterThan(0)
    expect(DEFAULT_CREDIT_COSTS.email_generator).toBeGreaterThan(0)
    expect(DEFAULT_CREDIT_COSTS.argument_improver).toBeGreaterThan(0)
    expect(DEFAULT_CREDIT_COSTS.embedding_search).toBeGreaterThan(0)
  })

  it('computes remaining credits with lower bound at zero', () => {
    expect(getRemainingCredits(5, 10)).toBe(5)
    expect(getRemainingCredits(12, 10)).toBe(0)
  })

  it('formats local date keys using ISO date ordering', () => {
    const key = getLocalDateKey('UTC', new Date('2025-01-02T12:00:00Z'))
    expect(key).toBe('2025-01-02')
  })

  it('falls back to UTC for invalid timezones', () => {
    const key = getLocalDateKey('Not/AZone', new Date('2025-01-02T12:00:00Z'))
    expect(key).toBe('2025-01-02')
  })
})
