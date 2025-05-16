'use client';

import React, { useState, useEffect } from 'react';
import { PayPoint } from '@/lib/models/salary';
import { TEXT } from '@/lib/constants/text';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'; // Changed to react-icons

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

interface PayPointListItemProps {
  point: PayPoint;
  onRemove: () => void;
  onEdit: (newPoint: PayPoint) => ValidationResult;
  currentYear: number;
  minYear: number;
}

export default function PayPointListItem({
  point,
  onRemove,
  onEdit,
  currentYear,
  minYear,
}: PayPointListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedYear, setEditedYear] = useState(point.year.toString());
  const [editedPay, setEditedPay] = useState(point.pay.toLocaleString('nb-NO'));
  const [validationError, setValidationError] = useState('');

  // We no longer fetch inflationData here; minYear is passed in

  useEffect(() => {
    // Reset edited values when point changes
    setEditedYear(point.year.toString());
    setEditedPay(point.pay.toLocaleString('nb-NO'));
    setValidationError('');
  }, [point]);

  const handleSave = () => {
    const newYear = Number(editedYear);
    const newPay = Number(editedPay.replace(/\s/g, ''));
    const newPoint = { year: newYear, pay: newPay };
    const result = onEdit(newPoint);
    if (result.isValid) {
      setIsEditing(false);
      setValidationError('');
    } else if (result.errorMessage) {
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
      <div className="flex flex-col bg-white rounded-lg shadow p-2 sm:p-3 space-y-2">
        <div className="flex space-x-2">
          <input
            type="number"
            min={minYear}
            max={currentYear}
            value={editedYear}
            onChange={e => setEditedYear(e.target.value)}
            className={`w-1/3 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
              Number(editedYear) < minYear || Number(editedYear) > currentYear
                ? 'border-red-500'
                : ''
            }`}
          />
          <input
            type="text"
            inputMode="numeric"
            value={editedPay}
            onChange={e => setEditedPay(e.target.value.replace(/[^\d\s]/g, ''))}
            className={`flex-1 border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-600 ${
              Number(editedPay.replace(/\s/g, '')) <= 0 ? 'border-red-500' : ''
            }`}
            placeholder="Positiv lønn"
          />
        </div>
        {validationError && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
            {validationError}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm text-gray-600 border rounded-md hover:bg-gray-100"
          >
            {TEXT.common.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            {TEXT.common.save}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow p-2 sm:p-3">
      <div className="flex space-x-4">
        <span className="font-medium text-gray-700">{point.year}</span>
        <span className="font-semibold text-gray-900">
          {point.pay.toLocaleString('nb-NO')}
        </span>
      </div>
      <div className="flex space-x-3"> {/* Increased space between buttons */}
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-indigo-600 rounded-full hover:bg-indigo-50"
          title={TEXT.common.edit} // Add tooltip for accessibility
        >
          <FaPencilAlt size={16} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 text-red-600 rounded-full hover:bg-red-50"
          title={TEXT.common.remove} // Add tooltip for accessibility
        >
          <FaTrashAlt size={16} />
        </button>
      </div>
    </div>
  );
}
