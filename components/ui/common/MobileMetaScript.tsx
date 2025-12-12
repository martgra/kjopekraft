'use client'

import { useEffect } from 'react'

export default function MobileMetaScript() {
  useEffect(() => {
    // Prevent double-tap zoom on mobile, but allow on charts
    const handleTouchStart = (event: TouchEvent) => {
      // Skip this prevention if we're in a chart container
      const target = event.target as HTMLElement
      const isChartElement = target.closest('.chart-container') !== null

      if (event.touches.length > 1 && !isChartElement) {
        event.preventDefault()
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })

    // Enhance chart touch behavior for mobile
    const chartElements = document.querySelectorAll('.chart-container canvas')
    chartElements.forEach(chart => {
      chart.addEventListener(
        'touchmove',
        e => {
          // Allow chart panning
          e.stopPropagation()
        },
        { passive: true },
      )
    })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  return null
}
