'use client'

import React, { useState, useEffect } from 'react'
import { PayPoint } from '@/lib/models/salary'
import { TEXT } from '@/lib/constants/text'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa' // Changed to react-icons

interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

interface PayPointListItemProps {
  point: PayPoint
  onRemove: () => void
  onEdit: (newPoint: PayPoint) => ValidationResult
  currentYear: number
  minYear: number
}

export default function PayPointListItem({
  point,
  onRemove,
  onEdit,
  currentYear,
  minYear,
}: PayPointListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedYear, setEditedYear] = useState(point.year.toString())
  const [editedPay, setEditedPay] = useState(point.pay.toLocaleString('nb-NO'))
  const [validationError, setValidationError] = useState('')

  // We no longer fetch inflationData here; minYear is passed in

  useEffect(() => {
    // Reset edited values when point changes
    setEditedYear(point.year.toString())
    setEditedPay(point.pay.toLocaleString('nb-NO'))
    setValidationError('')
  }, [point])

  const handleSave = () => {
    const newYear = Number(editedYear)
    const newPay = Number(editedPay.replace(/\s/g, ''))
    const newPoint = { year: newYear, pay: newPay }
    const result = onEdit(newPoint)
    if (result.isValid) {
      setIsEditing(false)
      setValidationError('')
    } else if (result.errorMessage) {
      setValidationError(result.errorMessage)
    }
  }

  const handleCancel = () => {
    setEditedYear(point.year.toString())
    setEditedPay(point.pay.toLocaleString('nb-NO'))
    setValidationError('')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col space-y-2 rounded-lg bg-white p-2 shadow sm:p-3">
        <div className="flex space-x-2">
          <input
            type="number"
            min={minYear}
            max={currentYear}
            value={editedYear}
            onChange={e => setEditedYear(e.target.value)}
            className={`w-1/3 rounded-md border px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-300 focus:outline-none ${
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
            className={`flex-1 rounded-md border px-2 py-1 text-sm placeholder-gray-600 focus:ring-2 focus:ring-indigo-300 focus:outline-none ${
              Number(editedPay.replace(/\s/g, '')) <= 0 ? 'border-red-500' : ''
            }`}
            placeholder="Positiv lønn"
          />
        </div>
        {validationError && (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">{validationError}</div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="rounded-md border px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            {TEXT.common.cancel}
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
          >
            {TEXT.common.save}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-2 shadow sm:p-3">
      <div className="flex space-x-4">
        <span className="font-medium text-gray-700">{point.year}</span>
        <span className="font-semibold text-gray-900">{point.pay.toLocaleString('nb-NO')}</span>
      </div>
      <div className="flex space-x-3">
        {' '}
        {/* Increased space between buttons */}
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-full p-1.5 text-indigo-600 hover:bg-indigo-50"
          title={TEXT.common.edit} // Add tooltip for accessibility
        >
          <FaPencilAlt size={16} />
        </button>
        <button
          onClick={onRemove}
          className="rounded-full p-1.5 text-red-600 hover:bg-red-50"
          title={TEXT.common.remove} // Add tooltip for accessibility
        >
          <FaTrashAlt size={16} />
        </button>
      </div>
    </div>
  )
}
