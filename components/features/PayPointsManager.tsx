'use client';

import React, { useState } from 'react';
import { usePayPoints } from '@/components/context/PayPointsContext';
import PayPointForm from '@/components/ui/PayPointForm';
import PayPointListItem from '@/components/ui/PayPointListItem';
import { DEFAULT_SALARY } from '@/lib/constants';

export default function PayPointsManager() {
  const { payPoints, addPoint, removePoint, resetPoints } = usePayPoints();
  const sorted = [...payPoints].sort((a, b) => a.year - b.year);
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
          Dine lønnspunkter ({sorted.length})
        </h4>
        {sorted.length > 0 && (
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
        {sorted.map((point, idx) => (
          <PayPointListItem 
            key={`${point.year}-${point.pay}-${idx}`}
            point={point}
            onRemove={() => removePoint(point.year, point.pay)}
          />
        ))}
      </div>

      {/* New point form */}
      <PayPointForm
        newYear={newYear}
        newPay={newPay}
        currentYear={currentYear}
        onYearChange={setNewYear}
        onPayChange={setNewPay}
        onAdd={handleAdd}
      />
    </div>
  );
}
