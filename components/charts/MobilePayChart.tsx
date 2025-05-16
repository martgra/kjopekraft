'use client';

import React, { useEffect, useRef } from 'react';
import { useInflation } from '@/features/inflation/hooks/useInflation';
import { useSalaryPoints } from '@/features/paypoints/hooks/useSalaryPoints';
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

// Register Chart.js components
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

export default function MobilePayChart() {
  // Fetch inflation data
  const { data: inflationData = [], isLoading: infLoading } = useInflation();

  // Manage salary points with inflation data range
  const {
    payPoints,
    isLoading: ptsLoading,
  } = useSalaryPoints(inflationData);

  // Compute adjusted salary series and yearRange
  const {
    salaryData: adjustedPayData,
    yearRange,
    isLoading: calcLoading,
  } = useSalaryCalculations(payPoints, inflationData);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<'line', Point[], number> | null>(null);

  // Interpolation helper
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
      if (prev && next) {
        const t = (year - prev.x) / (next.x - prev.x);
        result.push({ x: year, y: prev.y + t * (next.y - prev.y) });
      } else {
        result.push({ x: year, y: null });
      }
    }
    return result;
  }

  const loading = infLoading || ptsLoading || calcLoading;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <LoadingSpinner size="small" text="Laster data..." />
        </div>
      );
    }
    if (payPoints.length < 1) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-500 mb-3 text-sm">Ingen lønnsdata tilgjengelig.</p>
        </div>
      );
    }
    return <canvas ref={chartRef} className="w-full h-full" />;
  };

  useEffect(() => {
    if (loading || payPoints.length < 1 || !chartRef.current) return;

    // Destroy previous chart instance
    chartInstance.current?.destroy();

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const { minYear, maxYear } = yearRange;
    const rawActual = payPoints.map((p) => ({ x: p.year, y: p.pay }));
    const rawAdjusted = adjustedPayData.map((p) => ({ x: p.year, y: p.inflationAdjustedPay }));
    const fullActual = interpolateYearly(rawActual, minYear, maxYear);
    const fullAdjusted = interpolateYearly(rawAdjusted, minYear, maxYear);

    // Helper to hide excess dots
    const makePointRadius = (maxMarkers: number) => (ctx: any) => {
      const total = ctx.dataset.data.length;
      if (total <= maxMarkers) return 4;
      const interval = Math.ceil(total / maxMarkers);
      return ctx.dataIndex % interval === 0 ? 4 : 0;
    };

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Faktisk lønn',
            data: fullActual,
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            pointBackgroundColor: 'rgb(37, 99, 235)',
            pointRadius: makePointRadius(10),
            tension: 0.3,
            fill: false,
            spanGaps: true,
            borderWidth: 3,
          },
          {
            label: 'Inflasjonsjustert',
            data: fullAdjusted,
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            pointBackgroundColor: 'rgb(220, 38, 38)',
            pointRadius: makePointRadius(10),
            tension: 0.3,
            fill: false,
            spanGaps: true,
            borderWidth: 3,
            borderDash: [5, 5],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        locale: 'nb-NO',
        aspectRatio: 1,
        scales: {
          x: {
            type: 'linear',
            min: minYear,
            max: maxYear,
            ticks: { stepSize: 1, precision: 0, maxTicksLimit: 5 },
            title: { display: true, text: 'År' },
          },
          y: {
            beginAtZero: false,
            ticks: {
              maxTicksLimit: 5,
              callback: (val) => Math.round(+val / 1000) + 'k',
            },
            title: { display: true, text: 'Lønn (k NOK)' },
          },
        },
        plugins: {
          tooltip: {
            mode: 'nearest',
            intersect: false,
            callbacks: {
              title: (items) => 'År: ' + items[0].parsed.x,
              label: (ctx) => {
                const prefix = ctx.dataset.label ? ctx.dataset.label + ': ' : ''; 
                return prefix + (ctx.parsed.y !== null ? ctx.parsed.y.toLocaleString('nb-NO') + ' kr' : '—');
              },
            },
          },
          legend: { position: 'bottom', align: 'center' },
          title: {
            display: true,
            text: 'Lønn vs. Inflasjon',
            font: { size: 14, weight: 'bold' },
            padding: { top: 10, bottom: 15 },
          },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [loading, payPoints, adjustedPayData, yearRange]);

  return (
    <div className="w-full h-full bg-white p-3 rounded-xl shadow-md mobile-chart-container">
      <div className="text-center text-xs text-gray-500 mb-1 md:hidden">
        Trykk på punktene for detaljer
      </div>
      {renderContent()}
    </div>
  );
}