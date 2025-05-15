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

export default function MobilePayChart() {
  const { payPoints, addPoint, isLoading } = usePayPoints();
  const { salaryData: adjustedPayData, yearRange, isLoading: isSalaryDataLoading } = useSalaryCalculations();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  // Function to add example data
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
    
    return (
      <canvas ref={chartRef} className="w-full h-full"></canvas>
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
    
    // Filter data to avoid overcrowding on mobile
    // For mobile we'll just use actual data points and fewer interpolated points
    const filterDataForMobile = () => {
      if (!adjustedPayData || adjustedPayData.length === 0) {
        return { actual: [], adjusted: [] };
      }
      
      // Get the actual pay data points
      const actualPoints = [...payPoints].sort((a, b) => a.year - b.year)
        .map(point => ({
          x: point.year,
          y: point.pay,
          isInterpolated: false
        }));
      
      // Get the inflation-adjusted values, but only for the actual years we have data
      const adjustedPoints = adjustedPayData
        .filter(point => payPoints.some(p => p.year === point.year))
        .map(point => ({
          x: point.year,
          y: point.inflationAdjustedPay,
          isInterpolated: false
        }));
      
      return {
        actual: actualPoints,
        adjusted: adjustedPoints
      };
    };
    
    const mobileData = filterDataForMobile();
    
    // Create mobile-friendly chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Faktisk lønn',
            data: mobileData.actual,
            borderColor: 'rgb(37, 99, 235)',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            pointBackgroundColor: 'rgb(37, 99, 235)',
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.3,
            fill: false,
            borderWidth: 3
          },
          {
            label: 'Inflasjonsjustert',
            data: mobileData.adjusted,
            borderColor: 'rgb(220, 38, 38)',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            pointBackgroundColor: 'rgb(220, 38, 38)',
            pointRadius: 5,
            pointHoverRadius: 8,
            tension: 0.3,
            fill: false,
            borderWidth: 3,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        locale: 'nb-NO',
        aspectRatio: 1,
        layout: {
          padding: {
            top: 20  // Add top padding to compensate for removed legend margin
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              // Show fewer ticks on mobile
              maxTicksLimit: 5,
              callback: function(tickValue: string | number): string {
                // Format numbers with thousand separators for better readability
                const numValue = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                const shortened = Math.round(numValue / 1000);
                return shortened + 'k';
              }
            },
            title: {
              display: true,
              text: 'Lønn (k NOK)'
            }
          },
          x: {
            type: 'linear',
            min: minYear,
            max: maxYear,
            ticks: {
              stepSize: 1, // Force whole-number (year) ticks
              precision: 0, // Remove decimal points
              maxTicksLimit: 5, // Limit ticks for mobile
              callback: function(tickValue: string | number): number | string {
                // Ensure we're working with a number before calling Math.floor
                const numValue = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
                return Math.floor(numValue); // Ensure whole numbers for years
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
            enabled: true,
            mode: 'nearest',
            intersect: false,
            displayColors: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#333',
            borderColor: '#ddd',
            borderWidth: 1,
            padding: 10,
            titleFont: {
              size: 12,
              weight: 'bold'
            },
            bodyFont: {
              size: 11
            },
            callbacks: {
              title: function(items) {
                // Display the year as the title
                return 'År: ' + items[0].parsed.x;
              },
              label: function(context: {dataset: {label?: string}, parsed: {x: number, y: number | null}, raw: any}): string {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toLocaleString('nb-NO') + ' kr';
                }
                return label;
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
              font: {
                size: 12,
                weight: 500
              }
            },
            // Chart.js Legend doesn't support margin directly
            // We'll add padding to the chart layout instead
            onClick: function() {
              // Disable legend click for mobile to prevent accidental toggling
              return false;
            }
          },
          title: {
            display: true,
            text: 'Lønn vs. Inflasjon',
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: {
              top: 10,
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
