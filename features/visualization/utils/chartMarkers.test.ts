/// <reference types="vitest" />

import { createReasonMarkerPlugin, REASON_EMOJI } from './chartMarkers'
import type { PayPoint } from '@/domain/salary'

describe('REASON_EMOJI', () => {
  it('defines emoji for promotion', () => {
    expect(REASON_EMOJI.promotion).toBe('🎖️')
  })

  it('defines emoji for newJob', () => {
    expect(REASON_EMOJI.newJob).toBe('💼')
  })

  it('defines null for adjustment (no emoji)', () => {
    expect(REASON_EMOJI.adjustment).toBeNull()
  })
})

describe('createReasonMarkerPlugin', () => {
  const mockPayPoints: PayPoint[] = [
    { year: 2020, pay: 500000, reason: 'newJob' },
    { year: 2021, pay: 520000, reason: 'adjustment' },
    { year: 2022, pay: 600000, reason: 'promotion' },
    { year: 2023, pay: 650000, reason: 'adjustment' },
  ]

  it('creates a plugin with correct id', () => {
    const plugin = createReasonMarkerPlugin(mockPayPoints)
    expect(plugin.id).toBe('reasonMarkers')
  })

  it('creates a plugin with default font size of 20px', () => {
    const plugin = createReasonMarkerPlugin(mockPayPoints)
    expect(plugin).toBeDefined()
    expect(plugin.afterDatasetsDraw).toBeInstanceOf(Function)
  })

  it('creates a plugin with custom font size', () => {
    const plugin = createReasonMarkerPlugin(mockPayPoints, 16)
    expect(plugin).toBeDefined()
    expect(plugin.afterDatasetsDraw).toBeInstanceOf(Function)
  })

  it('has an afterDatasetsDraw hook', () => {
    const plugin = createReasonMarkerPlugin(mockPayPoints)
    expect(plugin.afterDatasetsDraw).toBeInstanceOf(Function)
  })

  describe('afterDatasetsDraw hook', () => {
    it('handles charts with no scales gracefully', () => {
      const plugin = createReasonMarkerPlugin(mockPayPoints)
      const mockChart = {
        ctx: {} as CanvasRenderingContext2D,
        scales: {},
        data: { datasets: [{ data: [] }] },
      } as any

      // Should not throw
      expect(() => plugin.afterDatasetsDraw(mockChart)).not.toThrow()
    })

    it('handles charts with no dataset gracefully', () => {
      const plugin = createReasonMarkerPlugin(mockPayPoints)
      const mockChart = {
        ctx: {} as CanvasRenderingContext2D,
        scales: {
          x: { getPixelForValue: vi.fn() },
          y: { getPixelForValue: vi.fn() },
        },
        data: { datasets: [] },
      } as any

      // Should not throw
      expect(() => plugin.afterDatasetsDraw(mockChart)).not.toThrow()
    })

    it('calls fillText for points with emojis', () => {
      const plugin = createReasonMarkerPlugin(mockPayPoints)
      const mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D

      const mockChart = {
        ctx: mockCtx,
        scales: {
          x: { getPixelForValue: vi.fn().mockReturnValue(100) },
          y: { getPixelForValue: vi.fn().mockReturnValue(200) },
        },
        data: {
          datasets: [
            {
              data: [
                { x: 2020, y: 500000 }, // newJob - has emoji
                { x: 2021, y: 520000 }, // adjustment - no emoji
                { x: 2022, y: 600000 }, // promotion - has emoji
              ],
            },
          ],
        },
      } as any

      plugin.afterDatasetsDraw(mockChart)

      // Should call fillText twice (newJob + promotion)
      expect(mockCtx.fillText).toHaveBeenCalledTimes(2)
      expect(mockCtx.fillText).toHaveBeenCalledWith('💼', 100, 192) // y - 8
      expect(mockCtx.fillText).toHaveBeenCalledWith('🎖️', 100, 192)
      expect(mockCtx.save).toHaveBeenCalledTimes(2)
      expect(mockCtx.restore).toHaveBeenCalledTimes(2)
    })

    it('sets correct font size', () => {
      const plugin = createReasonMarkerPlugin(mockPayPoints, 24)
      const mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
        font: '',
        textAlign: '',
        textBaseline: '',
      } as unknown as CanvasRenderingContext2D

      const mockChart = {
        ctx: mockCtx,
        scales: {
          x: { getPixelForValue: vi.fn().mockReturnValue(100) },
          y: { getPixelForValue: vi.fn().mockReturnValue(200) },
        },
        data: {
          datasets: [
            {
              data: [{ x: 2022, y: 600000 }], // promotion
            },
          ],
        },
      } as any

      plugin.afterDatasetsDraw(mockChart)

      expect(mockCtx.font).toBe('24px sans-serif')
    })

    it('skips points without matching pay points', () => {
      const plugin = createReasonMarkerPlugin([])
      const mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        fillText: vi.fn(),
      } as unknown as CanvasRenderingContext2D

      const mockChart = {
        ctx: mockCtx,
        scales: {
          x: { getPixelForValue: vi.fn() },
          y: { getPixelForValue: vi.fn() },
        },
        data: {
          datasets: [
            {
              data: [{ x: 2025, y: 700000 }],
            },
          ],
        },
      } as any

      plugin.afterDatasetsDraw(mockChart)

      expect(mockCtx.fillText).not.toHaveBeenCalled()
    })
  })
})
