'use client';

import React, { useState } from 'react';
import { usePayPoints } from '@/components/context/PayPointsContext';
import PayPointForm from '@/components/ui/PayPointForm';
import PayPointListItem from '@/components/ui/PayPointListItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { DEFAULT_SALARY } from '@/lib/constants';

export default function PayPointsManager() {
  const { payPoints, addPoint, removePoint, editPoint, resetPoints, isLoading } = usePayPoints();
  const sorted = isLoading ? [] : [...payPoints].sort((a, b) => a.year - b.year);
  const currentYear = new Date().getFullYear();

  // local state for the "new" row (strings so backspace works)
  const [newYear, setNewYear] = useState<string>('');
  const [newPay, setNewPay] = useState<string>('');

  const handleAdd = () => {
    const y = Number(newYear);
    // Remove any spaces before converting to number
    const p = Number(newPay.replace(/\s/g, ''));
    if (!y || !p || y > currentYear) return;
    addPoint({ year: y, pay: p });
    setNewYear('');
    setNewPay('');
  };

  // Default points for reset
  const defaultPoints = [
    { year: 2015, pay: DEFAULT_SALARY },
    { year: 2023, pay: DEFAULT_SALARY },
  ];
  
  // Function to handle reset
  const handleReset = () => {
    if (confirm('Er du sikker på at du vil tilbakestille alle lønnspunkter?')) {
      resetPoints(defaultPoints);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with reset button */}
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-500">
          Dine lønnspunkter ({isLoading ? '...' : sorted.length})
        </h4>
        {!isLoading && sorted.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-gray-500 hover:text-red-600 underline"
          >
            Tilbakestill
          </button>
        )}
      </div>
      
      {/* Existing points */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="small" text="Laster data..." />
          </div>
        ) : sorted.length > 0 ? (
          sorted.map((point, idx) => (
            <PayPointListItem 
              key={`${point.year}-${point.pay}-${idx}`}
              point={point}
              currentYear={currentYear}
              onRemove={() => removePoint(point.year, point.pay)}
              onEdit={(newPoint) => editPoint(point.year, point.pay, newPoint)}
            />
          ))
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700 text-sm">
            <p>Ingen lønnspunkter lagt til ennå. Bruk skjemaet nedenfor for å legge til ditt første lønnspunkt.</p>
          </div>
        )}
      </div>

      {/* New point form */}
      {!isLoading && (
        <PayPointForm
          newYear={newYear}
          newPay={newPay}
          currentYear={currentYear}
          onYearChange={setNewYear}
          onPayChange={setNewPay}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
}
