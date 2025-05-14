'use client';

import { usePayPoints } from '@/components/context/PayPointsContext';
import { useMemo } from 'react';
import { SalaryService } from '@/lib/services/salaryService';

/**
 * Custom hook that provides salary calculations based on user's pay points
 */
export function useSalaryCalculations() {
  const { payPoints, isLoading } = usePayPoints();
  
  // Calculate inflation-adjusted pay data
  const salaryData = useMemo(() => {
    return SalaryService.calculateInflationAdjustedPay(payPoints);
  }, [payPoints]);
  
  // Calculate salary statistics
  const statistics = useMemo(() => {
    return SalaryService.calculateSalaryStatistics(payPoints);
  }, [payPoints]);
  
  // Get min/max years for charts
  const yearRange = useMemo(() => {
    if (salaryData.length === 0) {
      const currentYear = new Date().getFullYear();
      // Provide reasonable defaults for empty data
      return { minYear: currentYear - 5, maxYear: currentYear };
    }
    
    const years = salaryData.map(point => point.year);
    return {
      minYear: Math.min(...years),
      maxYear: Math.max(...years)
    };
  }, [salaryData]);
  
  // Check if the data is actually valid and usable
  const hasValidData = useMemo(() => {
    return !isLoading && payPoints.length > 0 && !Number.isNaN(statistics.startingPay);
  }, [isLoading, payPoints, statistics]);
  
  return {
    salaryData,
    statistics,
    yearRange,
    hasData: hasValidData,
    isLoading
  };
}
