'use client';

import React, { useState } from 'react';
import { PayPoint } from '@/lib/models/salary';

interface PayPointListItemProps {
  point: PayPoint;
  onRemove: () => void;
  onEdit: (newPoint: PayPoint) => void;
  currentYear: number;
}

export default function PayPointListItem({ point, onRemove, onEdit, currentYear }: PayPointListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedYear, setEditedYear] = useState(point.year.toString());
  // Format the pay with spaces for thousands
  const [editedPay, setEditedPay] = useState(point.pay.toLocaleString('nb-NO'));
  
  const [validationError, setValidationError] = useState('');
  
  const handleSave = () => {
    const newYear = Number(editedYear);
    const newPay = Number(editedPay.replace(/\s/g, ''));
    
    // Validate inputs
    if (!newYear || isNaN(newYear)) {
      setValidationError('Angi et gyldig år');
      return;
    }
    
    if (newYear > currentYear) {
      setValidationError(`Året kan ikke være større enn ${currentYear}`);
      return;
    }
    
    if (!newPay || isNaN(newPay)) {
      setValidationError('Angi en gyldig lønn');
      return;
    }
    
    // Clear any validation errors
    setValidationError('');
    
    // Save the edited point
    onEdit({ year: newYear, pay: newPay });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedYear(point.year.toString());
    setEditedPay(point.pay.toLocaleString('nb-NO'));
    setValidationError('');
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <div className="flex flex-col bg-white rounded-lg shadow p-3 space-y-3">
        <div className="flex space-x-3">
          {/* Year input */}
          <div className="w-1/3">
            <input
              type="number"
              min={0}
              max={currentYear}
              value={editedYear}
              onChange={(e) => setEditedYear(e.target.value)}
              className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
              className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
        
        {/* Validation error */}
        {validationError && (
          <div className="text-red-500 text-xs mt-1">
            {validationError}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex space-x-2 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 text-xs"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
          >
            Lagre
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-3">
      <div className="flex space-x-4">
        <span className="font-medium text-gray-700">{point.year || '--'}</span>
        <span className="font-semibold text-gray-900">
          {point.pay ? point.pay.toLocaleString('nb-NO') : '--'}
        </span>
      </div>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Endre
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Fjern
        </button>
      </div>
    </div>
  );
}
