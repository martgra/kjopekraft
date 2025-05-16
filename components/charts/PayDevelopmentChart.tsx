'use client';

import React, { useEffect, useRef } from 'react';
import type { PayPoint } from '@/lib/models/salary';
import type { InflationDataPoint } from '@/lib/models/inflation';
import { useSalaryCalculations } from '@/features/paypoints/hooks/useSalaryCalculations';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
} from 'chart.js';

// Register the Chart.js pieces we need
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

interface PayDevelopmentChartProps {
  payPoints: PayPoint[];
  inflationData: InflationDataPoint[];
}

type RawPoint = { x: number; y: number };

/**
 * Helper to linearly interpolate a value for each year in [minYear..maxYear].
 * Filter out null values before returning.
 */
function interpolateYearly(
  known: { x: number; y: number | null }[],
  minYear: number,
  maxYear: number
): RawPoint[] {
  // Filter out null or undefined values first
  const validPoints = known.filter(p => p.y !== null && p.y !== undefined);
  
  if (validPoints.length === 0) {
    console.log('No valid points for interpolation');
    return [];
  }
  
  const sorted = validPoints.slice().sort((a, b) => a.x - b.x);
  const out: { x: number; y: number | null }[] = [];
  
  for (let year = minYear; year <= maxYear; year++) {
    const exact = sorted.find(p => p.x === year);
    if (exact) {
      out.push({ x: year, y: exact.y });
    } else {
      const prev = sorted.filter(p => p.x < year).pop();
      const next = sorted.find(p => p.x > year);
  if (prev && next && prev.y != null && next.y != null) {
      // compute interpolation factor t here
      const t = (year - prev.x) / (next.x - prev.x);
      out.push({
       x: year,
        y: prev.y + t * (next.y - prev.y),
      });
    } else {
      out.push({ x: year, y: null });
    }
    }
  }
  
  // Filter out null values for the chart
  return out.filter((p): p is RawPoint => p.y !== null && p.y !== undefined);
}

export default function PayDevelopmentChart({
  payPoints,
  inflationData
}: PayDevelopmentChartProps) {
  // Always define hooks at the top level, regardless of conditions
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart|null>(null);
  
  // Let our pure hook derive the full salary series + axis range
  const {
    salaryData,     // [{ year, actualPay, inflationAdjustedPay, isInterpolated, ... }]
    yearRange: { minYear, maxYear },
    isLoading: calcLoading
  } = useSalaryCalculations(payPoints, inflationData);

  console.log('[Chart] Rendering with:', { 
    payPointsCount: payPoints.length,
    inflationDataCount: inflationData.length,
    salaryDataCount: salaryData.length,
    calcLoading,
    yearRange: { minYear, maxYear }
  });

  // Chart rendering effect
  useEffect(() => {
    // Skip effect if we don't have what we need
    if (calcLoading || payPoints.length === 0 || !chartRef.current) return;
    
    // Clean up old chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    console.log('Drawing chart with:', { 
      payPoints, 
      inflationData, 
      salaryData, 
      minYear, 
      maxYear 
    });

    try {
      // Build two series and interpolate year-by-year
      const rawActual = salaryData.map(pt => ({ x: pt.year, y: pt.actualPay }));
      const rawInfl   = salaryData.map(pt => ({ x: pt.year, y: pt.inflationAdjustedPay }));
      
      console.log('Chart input data:', { rawActual, rawInfl });
      
      const actualPts = interpolateYearly(rawActual, minYear, maxYear);
      const inflPts   = interpolateYearly(rawInfl, minYear, maxYear);
      
      console.log('Interpolated points:', { actualPts, inflPts });

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'Faktisk lønn',
              data: actualPts,
              tension: 0.4,
              fill: true,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderColor: '#3b82f6',
              spanGaps: true
            },
            {
              label: 'Inflasjonsjustert',
              data: inflPts,
              tension: 0.4,
              fill: true,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderColor: '#10b981',
              spanGaps: true,
              borderDash: [5, 5]
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: {
              top: 8,
              right: 16,
              bottom: 8,
              left: 16
            }
          },
          scales: {
            x: {
              type: 'linear',
              min: minYear,
              max: maxYear,
              ticks: { stepSize: 1, precision: 0 },
              title: { display: true, text: 'År' }
            },
            y: {
              beginAtZero: false,
              ticks: {
                callback: v => (typeof v === 'number' ? v.toLocaleString('nb-NO') : '')
              },
              title: { display: true, text: 'Lønn (NOK)' }
            }
          },
          plugins: {
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: items => `År: ${items[0].parsed.x}`,
                label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString('nb-NO')} NOK`
              }
            },
            legend: { position: 'top', align: 'center' },
            title: {
              display: true,
              text: 'Lønnsutvikling vs. Inflasjon',
              font: { size: 16, weight: 'bold' },
              padding: { top: 0, bottom: 8 }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating chart:', error);
      // Show an error message in the UI
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          ctx.font = '16px Arial';
          ctx.fillStyle = 'red';
          ctx.textAlign = 'center';
          ctx.fillText('Error creating chart. See console for details.', 
            chartRef.current.width / 2, chartRef.current.height / 2);
        }
      }
    }

    // Return cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [salaryData, minYear, maxYear, payPoints.length, calcLoading, payPoints, inflationData]);

  // Log chart props and data
  console.log('📊 PayDevelopmentChart props:', { payPoints, inflationData });
  console.log('📊 salaryData & yearRange:', {
    salaryData,
    yearRange: { minYear, maxYear }
  });
  
  // Render loading state or chart
  if (calcLoading || payPoints.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        {calcLoading
          ? <LoadingSpinner size="large" text="Laster graf…" />
          : <p className="text-gray-500">Legg til et lønnspunkt for å se grafen.</p>}
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} className="w-full h-full" />
    </div>
  );
}
