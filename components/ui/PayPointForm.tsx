'use client';

import { useState, useEffect } from 'react';
import { InflationService } from '@/lib/services/inflationService';
import { usePayPoints } from '@/components/context/PayPointsContext';

interface PayPointFormProps {
  newYear: string;
  newPay: string;
  currentYear: number;
  minYear?: number; // Optional to maintain backward compatibility
  validationError?: string; // Optional external validation error
  onYearChange: (yearStr: string) => void;
  onPayChange: (payStr: string) => void;
  onAdd: () => void;
}

export default function PayPointForm({
  newYear,
  newPay,
  currentYear,
  minYear: propMinYear,
  validationError: externalValidationError,
  onYearChange,
  onPayChange,
  onAdd,
}: PayPointFormProps) {
  const [minYear, setMinYear] = useState<number>(propMinYear || 2015); // Use prop if provided, else default
  const [internalValidationError, setInternalValidationError] = useState<string>('');
  
  // Combine internal and external validation errors
  const validationError = externalValidationError || internalValidationError;
  
  // Get the inflation data from context
  const { inflationData } = usePayPoints();
  
  // Get minimum year if not provided via props
  useEffect(() => {
    if (propMinYear) {
      // Use prop if provided
      setMinYear(propMinYear);
    } else if (inflationData && inflationData.length > 0) {
      // Use dynamic inflation data if available
      setMinYear(Math.min(...inflationData.map(d => d.year)));
    } else {
      // Fall back to standard method if needed
      const years = InflationService.getInflationYears();
      if (years.length > 0) {
        setMinYear(Math.min(...years));
      }
    }
  }, [propMinYear, inflationData]);
  
  // parse for validation
  const yearNum = Number(newYear);
  const payNum = Number(newPay.replace(/\s/g, ''));
  
  // Validation logic
  const isYearValid = yearNum >= minYear && yearNum <= currentYear;
  const isPayValid = payNum > 0;
  const disabled = !newYear || !newPay || isNaN(yearNum) || isNaN(payNum) || !isYearValid || !isPayValid;
  
  // Set validation error message
  useEffect(() => {
    if (newYear && (!isNaN(yearNum) && !isYearValid)) {
      setInternalValidationError(`År må være mellom ${minYear} og ${currentYear}`);
    } else if (newPay && (!isNaN(payNum) && !isPayValid)) {
      setInternalValidationError('Lønn må være større enn 0');
    } else {
      setInternalValidationError('');
    }
  }, [newYear, newPay, yearNum, payNum, isYearValid, isPayValid, minYear, currentYear]);

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 space-y-3 sm:space-y-4">
      {validationError && (
        <div className="text-xs sm:text-sm text-red-600 mb-2 font-medium bg-red-50 p-2 rounded-md border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {validationError}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
        {/* Year */}
        <div className="flex-1">
          <label htmlFor="new-year" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            År ({minYear}-{currentYear})
          </label>
          <input
            id="new-year"
            type="number"
            min={minYear}
            max={currentYear}
            value={newYear}
            onChange={e => onYearChange(e.target.value)}
            placeholder={`f.eks. ${currentYear}`}
            className={`w-full border rounded-md px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-400 text-sm sm:text-base ${
              newYear && !isYearValid ? 'border-red-500' : ''
            }`}
            spellCheck="false"
            autoComplete="off"
            data-ms-editor="false"
          />
        </div>
        {/* Pay */}
        <div className="flex-1">
          <label htmlFor="new-pay" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            Lønn (NOK)
          </label>
          <input
            id="new-pay"
            type="text"
            inputMode="numeric"
            value={newPay}
            onChange={e => {
              // Only allow digits and spaces
              const sanitized = e.target.value.replace(/[^\d\s]/g, '');
              onPayChange(sanitized);
            }}
            placeholder="f.eks. 550 000"
            className={`w-full border rounded-md px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-400 text-sm sm:text-base ${
              newPay && !isPayValid ? 'border-red-500' : ''
            }`}
            min="1"
            spellCheck="false"
            autoComplete="off"
            data-ms-editor="false"
          />
        </div>
      </div>

      <button
        onClick={onAdd}
        disabled={disabled}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 sm:py-2.5 rounded-md disabled:opacity-50 transition text-sm sm:text-base font-medium"
        title={disabled ? 'Fyll ut gyldige verdier før du legger til' : 'Legg til nytt lønnspunkt'}
      >
        Legg til punkt
      </button>
    </div>
  );
}
