'use client'

import React, { useState, useMemo } from 'react'
import PayPointForm from '@/components/forms/PayPointForm'
import PayPointListItem from '@/components/forms/PayPointListItem'
import { TEXT } from '@/lib/constants/text'
import type { PayPoint } from '@/lib/models/salary'
import type { InflationDataPoint } from '@/lib/models/inflation'

interface DataEntryGuideProps {
  payPoints: PayPoint[]
  onAdd: (pt: PayPoint) => { isValid: boolean; errorMessage?: string }
  onRemove: (pt: PayPoint) => void
  onEdit: (oldPoint: PayPoint, newPoint: PayPoint) => { isValid: boolean; errorMessage?: string }
  onReset: () => void
  validatePoint: (pt: PayPoint) => { isValid: boolean; errorMessage?: string }
  inflationData: InflationDataPoint[]
}

export default function DataEntryGuide({
  payPoints,
  onAdd,
  onRemove,
  onEdit,
  onReset,
  validatePoint,
  inflationData,
}: DataEntryGuideProps) {
  const [year, setYear] = useState('')
  const [pay, setPay] = useState('')
  const [error, setError] = useState<string>()
  const currentYear = new Date().getFullYear()
  const minYear = useMemo(() => Math.min(...inflationData.map(d => d.year)), [inflationData])

  const handleAdd = () => {
    const yr = Number(year)
    const p = Number(pay.replace(/\s/g, ''))
    const validation = validatePoint({ year: yr, pay: p })
    if (!validation.isValid) {
      setError(validation.errorMessage)
      return
    }
    setError(undefined)
    onAdd({ year: yr, pay: p })
    setYear('')
    setPay('')
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{TEXT.forms.yourPoints}</h2>
        <button onClick={onReset} className="text-sm text-red-600 hover:underline">
          {TEXT.common.reset}
        </button>
      </div>
      <p className="text-gray-600">{TEXT.forms.noPointsMessage}</p>

      <PayPointForm
        newYear={year}
        newPay={pay}
        currentYear={currentYear}
        minYear={minYear}
        validationError={error}
        onYearChange={setYear}
        onPayChange={setPay}
        onAdd={handleAdd}
      />

      <div className="space-y-2">
        {payPoints.map(pt => (
          <PayPointListItem
            key={`${pt.year}-${pt.pay}`}
            point={pt}
            onRemove={() => onRemove(pt)}
            onEdit={newPt => onEdit(pt, newPt)}
            currentYear={currentYear}
            minYear={minYear}
          />
        ))}
      </div>
    </section>
  )
}
