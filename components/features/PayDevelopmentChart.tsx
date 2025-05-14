'use client';

import React, { useEffect, useRef } from 'react';
import { usePayPoints } from '@/components/context/PayPointsContext';
import { calculateInflationAdjustedPay } from '@/lib/salaryCalculations';
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

export default function PayDevelopmentChart() {
  const { payPoints } = usePayPoints();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || payPoints.length < 1) return;

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const adjustedPayData = calculateInflationAdjustedPay(payPoints);
    
    // Create datasets for the chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Find min and max years in the data
    const years = adjustedPayData.map(point => point.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    // Generate a complete dataset with all years, including those without data points
    const generateCompleteDataset = () => {
      const completeDataset = [];
      for (let year = minYear; year <= maxYear; year++) {
        const exactMatch = adjustedPayData.find(point => point.year === year);
        
        if (exactMatch) {
          // Use exact data if available
          completeDataset.push({
            x: year,
            y: exactMatch.actualPay,
            inflationY: exactMatch.inflationAdjustedPay
          });
        } else {
          // For years without exact data points, calculate interpolated values
          const prevPoint = adjustedPayData.filter(p => p.year < year).sort((a, b) => b.year - a.year)[0];
          const nextPoint = adjustedPayData.filter(p => p.year > year).sort((a, b) => a.year - b.year)[0];
          
          // Only interpolate if we have points on both sides
          if (prevPoint && nextPoint) {
            const totalYearSpan = nextPoint.year - prevPoint.year;
            const ratio = (year - prevPoint.year) / totalYearSpan;
            
            const interpolatedActualPay = prevPoint.actualPay + ratio * (nextPoint.actualPay - prevPoint.actualPay);
            const interpolatedInflationPay = prevPoint.inflationAdjustedPay + ratio * (nextPoint.inflationAdjustedPay - prevPoint.inflationAdjustedPay);
            
            completeDataset.push({
              x: year,
              y: interpolatedActualPay,
              inflationY: interpolatedInflationPay
            });
          }
        }
      }
      return completeDataset;
    };
    
    const completeDataset = generateCompleteDataset();
    
    // Format data for Chart.js in x,y coordinate format
    const actualPayDataPoints = completeDataset.map(point => ({
      x: point.x,
      y: point.y
    }));
    
    const inflationAdjustedDataPoints = completeDataset.map(point => ({
      x: point.x,
      y: point.inflationY
    }));

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Faktisk lønn',
            data: actualPayDataPoints,
            borderColor: '#3b82f6', // blue-500
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
          {
            label: 'Inflasjonsjustert lønn',
            data: inflationAdjustedDataPoints,
            borderColor: '#10b981', // emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: number): string {
                return value.toLocaleString('nb-NO');
              }
            },
            title: {
              display: true,
              text: 'Lønn (NOK)'
            }
          },
          x: {
            type: 'linear',
            min: minYear,
            max: maxYear,
            ticks: {
              stepSize: 1, // Force whole-number (year) ticks
              precision: 0, // Remove decimal points
              autoSkip: false, // Show all ticks
              callback: function(value: number): number | string {
                return Math.floor(value); // Ensure whole numbers for years
              }
            },
            title: {
              display: true,
              text: 'År'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context: {dataset: {label?: string}, parsed: {x: number, y: number | null}}): string {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toLocaleString('nb-NO') + ' NOK';
                  
                  // Check if this is an interpolated point
                  const yearExists = adjustedPayData.some(point => point.year === context.parsed.x);
                  if (!yearExists) {
                    label += ' (estimert)';
                  }
                }
                return label;
              }
            }
          },
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Lønnsutvikling vs. Inflasjon'
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [payPoints]);

  return (
    <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-md">
      {payPoints.length > 0 ? (
        <canvas ref={chartRef} height="300" />
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          Legg til lønnspunkter for å se diagram
        </div>
      )}
    </div>
  );
}