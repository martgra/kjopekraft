/// <reference types="vitest" />

import { createReasonMarkerPlugin, REASON_EMOJI } from '@/features/visualization/utils/chartMarkers'
import type { Chart } from 'chart.js'
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
      }

      const draw = plugin.afterDatasetsDraw as (chart: unknown) => void
      expect(() => draw(mockChart)).not.toThrow()
    })

    it('handles charts with no dataset gracefully', () => {
      const plugin = createReasonMarkerPlugin(mockPayPoints)
      const getPixelForValueMock: (
        value: number,
        index?: number,
        info?: unknown,
        includeOffset?: boolean,
      ) => number = vi.fn().mockReturnValue(0)
      const mockChart = {
        ctx: {} as CanvasRenderingContext2D,
        scales: {
          x: { getPixelForValue: getPixelForValueMock },
          y: { getPixelForValue: getPixelForValueMock },
        },
        data: { datasets: [] },
      }

      const draw = plugin.afterDatasetsDraw as (chart: unknown) => void
      expect(() => draw(mockChart)).not.toThrow()
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

      const getPixelForValueMock: (
        value: number,
        index?: number,
        info?: unknown,
        includeOffset?: boolean,
      ) => number = vi.fn().mockReturnValue(100)

      const mockChart = {
        ctx: mockCtx,
        scales: {
          x: { getPixelForValue: getPixelForValueMock },
          y: { getPixelForValue: getPixelForValueMock },
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
      }

      const draw = plugin.afterDatasetsDraw as (chart: unknown) => void
      draw(mockChart)

      // Should call fillText twice (newJob + promotion)
      expect(mockCtx.fillText).toHaveBeenCalledTimes(2)
      expect(mockCtx.fillText).toHaveBeenCalledWith('💼', 100, 92)
      expect(mockCtx.fillText).toHaveBeenCalledWith('🎖️', 100, 92)
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

      const getPixelForValueMock: (
        value: number,
        index?: number,
        info?: unknown,
        includeOffset?: boolean,
      ) => number = vi.fn().mockReturnValue(100)

      const mockChart = {
        ctx: mockCtx,
        scales: {
          x: { getPixelForValue: getPixelForValueMock },
          y: { getPixelForValue: getPixelForValueMock },
        },
        data: {
          datasets: [
            {
              data: [{ x: 2022, y: 600000 }], // promotion
            },
          ],
        },
      } as any

      const draw = plugin.afterDatasetsDraw as (chart: unknown) => void
      draw(mockChart)

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

      const draw = plugin.afterDatasetsDraw as (chart: unknown) => void
      draw(mockChart)

      expect(mockCtx.fillText).not.toHaveBeenCalled()
    })
  })
})
