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
  const { payPoints, addPoint, isLoading } = usePayPoints();
  const { salaryData: adjustedPayData, yearRange, isLoading: isSalaryDataLoading } = useSalaryCalculations();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Create a function to add example data
  const addExampleData = () => {
    const currentYear = new Date().getFullYear();
    const defaultSalary = 500000;
    addPoint({ year: currentYear - 5, pay: defaultSalary * 0.85 });
    addPoint({ year: currentYear, pay: defaultSalary });
  };

  // If data is loading or there are no points, show a placeholder or loading state
  const renderContent = () => {
    if (isLoading || isSalaryDataLoading) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <LoadingSpinner size="large" text="Loading salary data..." />
        </div>
      );
    }
    
    if (payPoints.length < 1) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center">
          <p className="text-gray-500 mb-4">No salary data available. Add your first data point to get started.</p>
          <button 
            onClick={addExampleData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add Example Data
          </button>
        </div>
      );
    }
    
    return (
      <canvas ref={chartRef} className="w-full h-60 px-0"></canvas>
    );
  };

  useEffect(() => {
    // Only initialize chart when not loading and we have data
    if (isLoading || isSalaryDataLoading || payPoints.length < 1 || !chartRef.current) return;
    
    // Always destroy previous chart to avoid memory leaks
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
    
    // Create datasets for the chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Use min and max years from our hooks
    const { minYear, maxYear } = yearRange;
    
    // Generate a complete dataset with all years, including those without data points
    const generateCompleteDataset = () => {
      // If we have no data, return empty dataset
      if (!adjustedPayData || adjustedPayData.length === 0) {
        return [];
      }
      
      const completeDataset = [];
      
      // First add all the actual data points - this ensures we use real data when available
      const actualDataPointsByYear = new Map();
      adjustedPayData.forEach(point => {
        actualDataPointsByYear.set(point.year, point);
      });

      // Now generate all years in the range, using the actual data points when available
      for (let year = minYear; year <= maxYear; year++) {
        const exactMatch = actualDataPointsByYear.get(year);
        
        if (exactMatch) {
          // Use exact data if available
          completeDataset.push({
            x: year,
            y: exactMatch.actualPay,
            inflationY: exactMatch.inflationAdjustedPay,
            isInterpolated: false
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
              inflationY: interpolatedInflationPay,
              isInterpolated: true
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
      y: point.y,
      // Custom properties for styling
      r: point.isInterpolated ? 3 : 5, // Smaller radius for interpolated points
      borderWidth: point.isInterpolated ? 1 : 2,
      hoverRadius: point.isInterpolated ? 4 : 6
    }));
    
    const inflationAdjustedDataPoints = completeDataset.map(point => ({
      x: point.x,
      y: point.inflationY,
      // Custom properties for styling
      r: point.isInterpolated ? 3 : 5, // Smaller radius for interpolated points
      borderWidth: point.isInterpolated ? 1 : 2,
      hoverRadius: point.isInterpolated ? 4 : 6
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
            pointRadius: undefined, // Use the custom radius from data points
            pointHoverRadius: undefined, // Use the custom radius from data points
            pointBorderWidth: undefined, // Use the custom width from data points
          },
          {
            label: 'Inflasjonsjustert lønn',
            data: inflationAdjustedDataPoints,
            borderColor: '#10b981', // emerald-500
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: undefined, // Use the custom radius from data points
            pointHoverRadius: undefined, // Use the custom radius from data points
            pointBorderWidth: undefined, // Use the custom width from data points
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 15
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(tickValue: string | number): string {
                // Ensure we're working with a number before calling toLocaleString
                const numValue = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                return numValue.toLocaleString('nb-NO');
              },
              padding: 5,
              maxTicksLimit: 8
            },
            title: {
              display: true,
              text: 'Lønn (NOK)',
              padding: {
                bottom: 10
              }
            }
          },
          x: {
            type: 'linear',
            min: minYear,
            max: maxYear,
            ticks: {
              stepSize: 1, // Force whole-number (year) ticks
              precision: 0, // Remove decimal points
              autoSkip: true, // Allow skipping ticks when needed
              maxTicksLimit: 10, // Limit number of ticks for better spacing
              callback: function(tickValue: string | number): number | string {
                // Ensure we're working with a number before calling Math.floor
                const numValue = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                return Math.floor(numValue); // Ensure whole numbers for years
              },
              padding: 5
            },
            title: {
              display: true,
              text: 'År',
              padding: {
                top: 10
              }
            }
          }
        },
        plugins: {
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#333',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            padding: 10,
            borderColor: 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            displayColors: true,
            boxWidth: 8,
            boxHeight: 8,
            usePointStyle: true,
            callbacks: {
              title: function(context) {
                return 'År: ' + context[0].parsed.x;
              },
              label: function(context: {dataset: {label?: string}, parsed: {x: number, y: number | null}, raw: any}): string {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toLocaleString('nb-NO') + ' NOK';
                  
                  // Check if this is an interpolated point using the flag we added
                  // Raw contains the original data object
                  const point = completeDataset.find(p => p.x === context.parsed.x);
                  if (point && point.isInterpolated) {
                    label += ' (estimert)';
                  }
                }
                return label;
              }
            }
          },
          legend: {
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
              padding: 15,
              font: {
                size: 13
              }
            },
            maxHeight: 40
          },
          title: {
            display: true,
            text: 'Lønnsutvikling vs. Inflasjon',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 5,
              bottom: 15
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [payPoints, adjustedPayData, isLoading, isSalaryDataLoading]);

  return (
    <div className="w-full h-full bg-white p-2 sm:p-3 md:p-4 rounded-xl shadow-md">
      {renderContent()}
    </div>
  );
}