import type { PayPoint, PayChangeReason } from '@/domain/salary'
import type { Chart, Plugin } from 'chart.js'

export const REASON_EMOJI: Record<PayChangeReason, string | null> = {
  promotion: '🎖️',
  newJob: '💼',
  adjustment: null,
}

export function createReasonMarkerPlugin(
  payPoints: PayPoint[],
  fontSize: number = 20,
): Plugin<'line'> {
  const reasonMap = new Map(payPoints.map(p => [p.year, p.reason]))

  return {
    id: 'reasonMarkers',
    afterDatasetsDraw(chart: Chart) {
      const ctx = chart.ctx
      const xScale = chart.scales.x
      const yScale = chart.scales.y

      // Guard against undefined scales
      if (!xScale || !yScale) return

      // Only draw on the actual salary dataset (first dataset)
      const dataset = chart.data.datasets[0]
      if (!dataset?.data) return

      dataset.data.forEach(point => {
        const scatterPoint = point as { x: number; y: number }
        const reason = reasonMap.get(scatterPoint.x)
        const emoji = reason ? REASON_EMOJI[reason] : null

        if (!emoji) return

        const x = xScale.getPixelForValue(scatterPoint.x)
        const y = yScale.getPixelForValue(scatterPoint.y)

        // Draw emoji above the point
        ctx.save()
        ctx.font = `${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(emoji, x, y - 8)
        ctx.restore()
      })
    },
  }
}
