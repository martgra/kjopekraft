'use client';

import React, { useEffect, useRef } from 'react';
import { usePayPoints } from '@/components/context/PayPointsContext';
import { useSalaryCalculations } from '@/lib/hooks/useSalaryCalculations';
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

// Register the components we need
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
  const { payPoints, addPoint, isLoading } = usePayPoints();
  const {
    salaryData: adjustedPayData,
    yearRange,
    isLoading: isSalaryDataLoading
  } = useSalaryCalculations();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart<'line', Point[], number> | null>(null);

  // Linearly interpolate a point for each year
  function interpolateYearly(
    points: { x: number; y: number }[],
    minYear: number,
    maxYear: number
  ): Point[] {
    const known = [...points].sort((a, b) => a.x - b.x);
    const result: Point[] = [];
    for (let year = minYear; year <= maxYear; year++) {
      const exact = known.find(p => p.x === year);
      if (exact) {
        result.push({ x: year, y: exact.y });
        continue;
      }
      const prev = known.filter(p => p.x < year).pop();
      const next = known.find(p => p.x > year);
      if (prev && next) {
        const t = (year - prev.x) / (next.x - prev.x);
        result.push({ x: year, y: prev.y + t * (next.y - prev.y) });
      } else {
        // outside range → leave gap
        result.push({ x: year, y: null });
      }
    }
    return result;
  }

  const addExampleData = () => {
    const currentYear = new Date().getFullYear();
    const defaultSalary = 500000;
    addPoint({ year: currentYear - 5, pay: defaultSalary * 0.85 });
    addPoint({ year: currentYear, pay: defaultSalary });
  };

  const renderContent = () => {
    if (isLoading || isSalaryDataLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <LoadingSpinner size="small" text="Loading..." />
        </div>
      );
    }
    if (payPoints.length < 1) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-500 mb-3 text-sm">No salary data available.</p>
          <button
            onClick={addExampleData}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          >
            Add Example Data
          </button>
        </div>
      );
    }
    return <canvas ref={chartRef} className="w-full h-full"></canvas>;
  };

  useEffect(() => {
    if (isLoading || isSalaryDataLoading || payPoints.length < 1 || !chartRef.current)
      return;

    // Destroy old chart
    chartInstance.current?.destroy();
    chartInstance.current = null;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    const { minYear, maxYear } = yearRange;

    // Prepare data
    const rawActual = payPoints.map(p => ({ x: p.year, y: p.pay }));
    const rawAdjusted = adjustedPayData.map(p => ({
      x: p.year,
      y: p.inflationAdjustedPay
    }));
    const fullActual = interpolateYearly(rawActual, minYear, maxYear);
    const fullAdjusted = interpolateYearly(rawAdjusted, minYear, maxYear);

    // Dot-hiding helper
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
            pointHoverRadius: 6,
            pointHitRadius: 10,
            tension: 0.3,
            fill: false,
            borderWidth: 3,
            spanGaps: true
          },
          {
            label: 'Inflasjonsjustert',
            data: fullAdjusted,
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            pointBackgroundColor: 'rgb(220, 38, 38)',
            pointRadius: makePointRadius(10),
            pointHoverRadius: 6,
            pointHitRadius: 10,
            tension: 0.3,
            fill: false,
            borderWidth: 3,
            borderDash: [5, 5],
            spanGaps: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        locale: 'nb-NO',
        aspectRatio: 1,
        layout: { padding: { top: 20 } },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              maxTicksLimit: 5,
              callback: val => Math.round(+val / 1000) + 'k'
            },
            title: { display: true, text: 'Lønn (k NOK)' }
          },
          x: {
            type: 'linear',
            min: minYear,
            max: maxYear,
            ticks: {
              stepSize: 1,
              precision: 0,
              maxTicksLimit: 5,
              callback: val => Math.floor(+val)
            },
            title: { display: true, text: 'År' }
          }
        },
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'nearest',
            intersect: false,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 10,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 11 },
            callbacks: {
              title: items => 'År: ' + items[0].parsed.x,
              label: ctx => {
                const prefix = ctx.dataset.label ? ctx.dataset.label + ': ' : '';
                return prefix +
                  (ctx.parsed.y !== null
                    ? ctx.parsed.y.toLocaleString('nb-NO') + ' kr'
                    : '—');
              }
            }
          },
          legend: {
            position: 'bottom',
            align: 'center',
            labels: {
              boxWidth: 12,
              padding: 18,
              usePointStyle: true,
              pointStyle: 'circle',
              font: { size: 12, weight: 500 }
            },
            onClick: () => false
          },
          title: {
            display: true,
            text: 'Lønn vs. Inflasjon',
            font: { size: 14, weight: 'bold' },
            padding: { top: 10, bottom: 15 }
          }
        }
      }
    });

    return () => {
      chartInstance.current?.destroy();
    };
  }, [payPoints, adjustedPayData, isLoading, isSalaryDataLoading, yearRange]);

  return (
    <div className="w-full h-full bg-white p-3 rounded-xl shadow-md mobile-chart-container">
      <div className="text-center text-xs text-gray-500 mb-1 md:hidden">
        Trykk på punktene for detaljer
      </div>
      {renderContent()}
    </div>
  );
}
