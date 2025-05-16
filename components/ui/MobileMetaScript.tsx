'use client';

import { useEffect } from 'react';

export default function MobileMetaScript() {
  useEffect(() => {
    // This script helps prevent unwanted zooming on mobile inputs
    // but allows panning on charts
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Prevent double-tap zoom on mobile, but allow on charts
    document.addEventListener('touchstart', function(event) {
      // Skip this prevention if we're in a chart container
      const target = event.target as HTMLElement;
      const isChartElement = target.closest('.chart-container') !== null;
      
      if (event.touches.length > 1 && !isChartElement) {
        event.preventDefault();
      }
    }, { passive: false });
    
    // Enhance chart touch behavior for mobile
    const chartElements = document.querySelectorAll('.chart-container canvas');
    chartElements.forEach(chart => {
      chart.addEventListener('touchmove', (e) => {
        // Allow chart panning
        e.stopPropagation();
      }, { passive: true });
    });
    
    return () => {
      document.getElementsByTagName('head')[0].removeChild(meta);
    };
  }, []);
  
  return null;
}
