// components/context/PayPointsContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from 'react';
import { PayPoint } from '@/lib/models/salary';
import { InflationService } from '@/lib/services/inflationService';

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

interface PayPointsContextValue {
  payPoints: PayPoint[];
  addPoint: (pt: PayPoint) => ValidationResult;
  removePoint: (year: number, pay: number) => void;
  editPoint: (oldYear: number, oldPay: number, newPoint: PayPoint) => ValidationResult;
  validatePoint: (pt: PayPoint) => ValidationResult;
  resetPoints: (defaultPoints: PayPoint[]) => void;
  isLoading: boolean; // Added to track initial loading state
}

const PayPointsContext = createContext<PayPointsContextValue | null>(null);

// Storage key for localStorage
const STORAGE_KEY = 'salary-calculator-points';

export function PayPointsProvider({
  children,
  initialPoints = [],
}: {
  children: ReactNode;
  initialPoints?: PayPoint[];
}) {
  // Track if we've loaded client-side data
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize with a placeholder empty array
  // We'll only show data after hydration is complete and localStorage is checked
  const [payPoints, setPayPoints] = useState<PayPoint[]>([]);
  
  // Load data from localStorage on client-side only
  useEffect(() => {
    try {
      const storedPoints = localStorage.getItem(STORAGE_KEY);
      if (storedPoints) {
        // We have stored data, use it
        const parsedPoints = JSON.parse(storedPoints) as PayPoint[];
        setPayPoints(parsedPoints.sort((a, b) => a.year - b.year));
      } else {
        // No stored data, use the initial points
        setPayPoints(
          initialPoints.length > 0
            ? [...initialPoints].sort((a, b) => a.year - b.year)
            : []
        );
      }
    } catch (err) {
      console.error('Error loading points from localStorage:', err);
      // On error, fall back to initial points
      setPayPoints(
        initialPoints.length > 0
          ? [...initialPoints].sort((a, b) => a.year - b.year)
          : []
      );
    } finally {
      setIsLoading(false);
    }
  }, [initialPoints]);

  // Save to localStorage whenever points change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payPoints));
      } catch (err) {
        console.error('Error saving points to localStorage:', err);
      }
    }
  }, [payPoints]);

  // Validate a PayPoint to ensure it meets all criteria
  const validatePoint = (pt: PayPoint): ValidationResult => {
    const currentYear = new Date().getFullYear();
    const minYear = Math.min(...InflationService.getInflationYears());
    
    if (!pt.year || isNaN(pt.year)) {
      return { isValid: false, errorMessage: 'År er påkrevd og må være et tall' };
    }
    
    if (pt.year < minYear || pt.year > currentYear) {
      return { 
        isValid: false, 
        errorMessage: `År må være mellom ${minYear} og ${currentYear}` 
      };
    }
    
    if (!pt.pay || isNaN(pt.pay) || pt.pay <= 0) {
      return { isValid: false, errorMessage: 'Lønn må være større enn 0' };
    }
    
    return { isValid: true };
  };

  // Add point with validation
  const addPoint = (pt: PayPoint): ValidationResult => {
    const validationResult = validatePoint(pt);
    
    if (validationResult.isValid) {
      setPayPoints((curr) => [...curr, pt].sort((a, b) => a.year - b.year));
    }
    
    return validationResult;
  };

  const removePoint = (yr: number, pay: number) =>
    setPayPoints((curr) =>
      curr.filter((p) => !(p.year === yr && p.pay === pay))
    );
  
  // Function to edit an existing point with validation
  const editPoint = (oldYear: number, oldPay: number, newPoint: PayPoint): ValidationResult => {
    const validationResult = validatePoint(newPoint);
    
    if (validationResult.isValid) {
      setPayPoints((curr) => {
        const newPoints = curr.filter((p) => !(p.year === oldYear && p.pay === oldPay));
        return [...newPoints, newPoint].sort((a, b) => a.year - b.year);
      });
    }
    
    return validationResult;
  };
    
  // Function to reset points to default values
  const resetPoints = (defaultPoints: PayPoint[]) => {
    setPayPoints([...defaultPoints].sort((a, b) => a.year - b.year));
  };

  const value = useMemo(
    () => ({ 
      payPoints, 
      addPoint, 
      removePoint, 
      editPoint, 
      validatePoint,
      resetPoints, 
      isLoading 
    }),
    [payPoints, isLoading]
  );

  return (
    <PayPointsContext.Provider value={value}>
      {children}
    </PayPointsContext.Provider>
  );
}

export function usePayPoints() {
  const ctx = useContext(PayPointsContext);
  if (!ctx) throw new Error('usePayPoints must be used inside PayPointsProvider');
  return ctx;
}
