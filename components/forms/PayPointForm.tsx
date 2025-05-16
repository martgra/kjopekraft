'use client';

import React, { useState, useEffect } from 'react';
import { PayPoint } from '@/lib/models/salary';
import { TEXT } from '@/lib/constants/text';

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

interface PayPointFormProps {
  newYear: string;
  newPay: string;
  currentYear: number;
  minYear: number;
  validationError?: string;
  onYearChange: (yearStr: string) => void;
  onPayChange: (payStr: string) => void;
  onAdd: () => void;
}

export default function PayPointForm({
  newYear,
  newPay,
  currentYear,
  minYear,
  validationError: externalValidationError,
  onYearChange,
  onPayChange,
  onAdd,
}: PayPointFormProps) {
  const [internalValidationError, setInternalValidationError] = useState<string>('');
  const validationError = externalValidationError || internalValidationError;

  // parse for validation
  const yearNum = Number(newYear);
  const payNum = Number(newPay.replace(/\s/g, ''));

  const isYearValid = !isNaN(yearNum) && yearNum >= minYear && yearNum <= currentYear;
  const isPayValid = !isNaN(payNum) && payNum > 0;
  const disabled = !newYear || !newPay || !isYearValid || !isPayValid;

  // Validate inputs on change
  useEffect(() => {
    if (newYear && (!isNaN(yearNum) && !isYearValid)) {
      setInternalValidationError(TEXT.forms.validation.yearRange.replace('{min}', String(minYear)).replace('{max}', String(currentYear)));
    } else if (newPay && (!isNaN(payNum) && !isPayValid)) {
      setInternalValidationError(TEXT.forms.validation.payPositive);
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
        <div className="flex-1">
          <label htmlFor="new-year" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            {TEXT.forms.yearLabel} ({minYear}-{currentYear})
          </label>
          <input
            id="new-year"
            type="number"
            min={minYear}
            max={currentYear}
            value={newYear}
            onChange={e => onYearChange(e.target.value)}
            placeholder={`f.eks. ${currentYear}`}
            className={`w-full border rounded-md px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-600 text-sm sm:text-base ${
              newYear && !isYearValid ? 'border-red-500' : ''
            }`}
            spellCheck="false"
            autoComplete="off"
            data-ms-editor="false"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="new-pay" className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
            {TEXT.forms.payLabel}
          </label>
          <input
            id="new-pay"
            type="text"
            inputMode="numeric"
            value={newPay}
            onChange={e => onPayChange(e.target.value.replace(/[^\d\s]/g, ''))}
            placeholder={TEXT.forms.payPlaceholder}
            className={`w-full border rounded-md px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-900 placeholder-gray-600 text-sm sm:text-base ${
              newPay && !isPayValid ? 'border-red-500' : ''
            }`}
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
        title={disabled ? TEXT.forms.addButtonDisabledTitle : TEXT.forms.addButtonTitle}
      >
        {TEXT.forms.addPointButton}
      </button>
    </div>
  );
}
