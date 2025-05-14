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

// Define PayPoint type here to avoid circular dependencies
export interface PayPoint {
  year: number;
  pay: number;
}

interface PayPointsContextValue {
  payPoints: PayPoint[];
  addPoint: (pt: PayPoint) => void;
  removePoint: (year: number, pay: number) => void;
  resetPoints: (defaultPoints: PayPoint[]) => void;
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
  // Initialize with server-side initial points first
  const [payPoints, setPayPoints] = useState<PayPoint[]>([...initialPoints].sort((a, b) => a.year - b.year));
  
  // Then use useEffect to update from localStorage only on client-side
  // This avoids hydration mismatch as it only runs after first render
  useEffect(() => {
    try {
      const storedPoints = localStorage.getItem(STORAGE_KEY);
      if (storedPoints) {
        const parsedPoints = JSON.parse(storedPoints) as PayPoint[];
        setPayPoints(parsedPoints.sort((a, b) => a.year - b.year));
      }
    } catch (err) {
      console.error('Error loading points from localStorage:', err);
    }
  }, []);

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

  const addPoint = (pt: PayPoint) =>
    setPayPoints((curr) =>
      [...curr, pt].sort((a, b) => a.year - b.year)
    );

  const removePoint = (yr: number, pay: number) =>
    setPayPoints((curr) =>
      curr.filter((p) => !(p.year === yr && p.pay === pay))
    );
    
  // Function to reset points to default values
  const resetPoints = (defaultPoints: PayPoint[]) => {
    setPayPoints([...defaultPoints].sort((a, b) => a.year - b.year));
  };

  const value = useMemo(
    () => ({ payPoints, addPoint, removePoint, resetPoints }),
    [payPoints]
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
