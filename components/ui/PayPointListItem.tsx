'use client';

import React, { useState, useEffect } from 'react';
import { PayPoint } from '@/lib/models/salary';
import { InflationService } from '@/lib/services/inflationService';

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

interface PayPointListItemProps {
  point: PayPoint;
  onRemove: () => void;
  onEdit: (newPoint: PayPoint) => ValidationResult;
  currentYear: number;
  minYear?: number; // Optional to maintain backward compatibility
}

export default function PayPointListItem({ point, onRemove, onEdit, currentYear, minYear: propMinYear }: PayPointListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedYear, setEditedYear] = useState(point.year.toString());
  // Format the pay with spaces for thousands
  const [editedPay, setEditedPay] = useState(point.pay.toLocaleString('nb-NO'));
  
  const [validationError, setValidationError] = useState('');
  const [minYear, setMinYear] = useState<number>(propMinYear || 2015); // Use prop if provided, else default
  
  // Get minimum year if not provided as prop
  useEffect(() => {
    if (!propMinYear) {
      const years = InflationService.getInflationYears();
      if (years.length > 0) {
        setMinYear(Math.min(...years));
      }
    } else {
      setMinYear(propMinYear);
    }
  }, [propMinYear]);
  
  const handleSave = () => {
    const newYear = Number(editedYear);
    const newPay = Number(editedPay.replace(/\s/g, ''));
    
    // Create the new point
    const newPoint = { year: newYear, pay: newPay };
    
    // We use onEdit function which now returns validation result
    const result = onEdit(newPoint);
    
    if (result.isValid) {
      // Clear validation errors on success
      setValidationError('');
      setIsEditing(false);
    } else if (result.errorMessage) {
      // Show validation error
      setValidationError(result.errorMessage);
    }
  };
  
  const handleCancel = () => {
    setEditedYear(point.year.toString());
    setEditedPay(point.pay.toLocaleString('nb-NO'));
    setValidationError('');
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div className="flex flex-col bg-white rounded-lg shadow p-2 sm:p-3 space-y-2 sm:space-y-3">
        <div className="flex space-x-2 sm:space-x-3">
          {/* Year input */}
          <div className="w-1/3">
            <input
              type="number"
              min={minYear}
              max={currentYear}
              value={editedYear}
              onChange={(e) => setEditedYear(e.target.value)}
              className={`w-full border rounded-md px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                editedYear && (Number(editedYear) < minYear || Number(editedYear) > currentYear) ? 'border-red-500' : ''
              }`}
              placeholder={`${minYear}-${currentYear}`}
            />
          </div>
          
          {/* Pay input */}
          <div className="flex-1">
            <input
              type="text"
              inputMode="numeric"
              value={editedPay}
              onChange={(e) => {
                // Only allow digits and spaces
                const sanitized = e.target.value.replace(/[^\d\s]/g, '');
                setEditedPay(sanitized);
              }}
              className={`w-full border rounded-md px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
                editedPay && (Number(editedPay.replace(/\s/g, '')) <= 0) ? 'border-red-500' : ''
              }`}
              placeholder="Positiv lønn"
              min="1"
            />
          </div>
        </div>
        
        {/* Validation error */}
        {validationError && (
          <div className="text-red-500 text-xs sm:text-sm mt-1 font-medium bg-red-50 p-1.5 rounded-md border border-red-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline-block mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-3 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 text-xs py-1 px-2 rounded-md border border-gray-300"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 text-xs font-medium py-1 px-3 rounded-md"
          >
            Lagre
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-lg shadow p-2 sm:p-3">
      <div className="flex space-x-4 mb-2 sm:mb-0">
        <span className="font-medium text-gray-700 text-sm sm:text-base">{point.year || '--'}</span>
        <span className="font-semibold text-gray-900 text-sm sm:text-base">
          {point.pay ? point.pay.toLocaleString('nb-NO') : '--'}
        </span>
      </div>
      <div className="flex space-x-2 sm:space-x-3 self-end sm:self-center">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium bg-white hover:bg-indigo-50 rounded-md border border-indigo-200 py-1 px-2"
          aria-label="Edit salary point"
        >
          Endre
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium bg-white hover:bg-red-50 rounded-md border border-red-200 py-1 px-2"
          aria-label="Remove salary point"
        >
          Fjern
        </button>
      </div>
    </div>
  );
}
