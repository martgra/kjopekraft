// components/charts/MobilePayChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { PayPoint } from '@/lib/models/salary';
import { InflationDataPoint } from '@/lib/models/inflation';
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
  CategoryScale,
} from 'chart.js';

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

type Point = { x: number; y: number | null };

interface MobilePayChartProps {
  payPoints: PayPoint[];
  inflationData: InflationDataPoint[];
}

export default function MobilePayChart({
  payPoints,
  inflationData,
}: MobilePayChartProps) {
  // derive the per‐year series & range
  const {
    salaryData: adjustedPayData,
    yearRange,
    isLoading: calcLoading,
  } = useSalaryCalculations(payPoints, inflationData);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<'line', Point[], number> | null>(null);

  // interpolate missing years
  function interpolateYearly(
    points: { x: number; y: number }[],
    minYear: number,
    maxYear: number
  ): Point[] {
    const known = [...points].sort((a, b) => a.x - b.x);
    const result: Point[] = [];
    for (let year = minYear; year <= maxYear; year++) {
      const exact = known.find((p) => p.x === year);
      if (exact) {
        result.push({ x: year, y: exact.y });
        continue;
      }
      const prev = known.filter((p) => p.x < year).pop();
      const next = known.find((p) => p.x > year);
      if (prev && next && prev.y != null && next.y != null) {
        const t = (year - prev.x) / (next.x - prev.x);
        result.push({ x: year, y: prev.y + t * (next.y - prev.y) });
      } else {
        result.push({ x: year, y: null });
      }
    }
    return result;
  }

  // show loading or empty states
  if (calcLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoadingSpinner size="small" text="Laster graf…" />
      </div>
    );
  }
  if (payPoints.length < 2) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-500 text-sm">
          Legg til minst to lønnspunkter for å vise graf.
        </p>
      </div>
    );
  }

  // render chart
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current?.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const { minYear, maxYear } = yearRange;
    const rawActual = payPoints.map((p) => ({ x: p.year, y: p.pay }));
    const rawInfl = adjustedPayData.map((p) => ({
      x: p.year,
      y: p.inflationAdjustedPay,
    }));

    const fullActual = interpolateYearly(rawActual, minYear, maxYear);
    const fullInfl = interpolateYearly(rawInfl, minYear, maxYear);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Faktisk lønn',
            data: fullActual,
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            pointRadius: 4,
            tension: 0.3,
            spanGaps: true,
            borderWidth: 3,
          },
          {
            label: 'Inflasjonsjustert',
            data: fullInfl,
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            pointRadius: 4,
            tension: 0.3,
            spanGaps: true,
            borderDash: [5, 5],
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            min: minYear,
            max: maxYear,
            ticks: { stepSize: 1, precision: 0 },
            title: { display: true, text: 'År' },
          },
          y: {
            beginAtZero: false,
            ticks: {
              callback: (val) => (typeof val === 'number' ? val.toLocaleString('nb-NO') : ''),
            },
            title: { display: true, text: 'Lønn (NOK)' },
          },
        },
        plugins: {
          legend: { position: 'bottom', align: 'center' },
          tooltip: {
            mode: 'nearest',
            intersect: false,
            callbacks: {
              title: (items) => `År: ${items[0].parsed.x}`,
              label: (ctx) =>
                `${ctx.dataset.label}: ${
                  ctx.parsed.y != null ? ctx.parsed.y.toLocaleString('nb-NO') + ' kr' : '—'
                }`,
            },
          },
          title: {
            display: true,
            text: 'Lønn vs. Inflasjon',
            padding: { top: 5, bottom: 10 },
          },
        },
      },
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [payPoints, adjustedPayData, yearRange]);

  return <canvas ref={chartRef} className="w-full h-full" />;
}
