'use client'

import { forwardRef, useCallback, useImperativeHandle, useState } from 'react'
import { Button, Card, Icon, Select, SelectOption } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { NEGOTIATION_MAX_POINTS, NEGOTIATION_POINT_TYPES } from '@/lib/negotiation/pointTypes'
import { AIAssistedField } from '@/components/ai/AIAssistedField'
import type { NegotiationPoint } from '@/lib/schemas/negotiation'

interface ArgumentBuilderProps {
  points: NegotiationPoint[]
  onAddPoint: (point: NegotiationPoint) => void
  className?: string
}

export interface ArgumentBuilderHandle {
  addCurrent: () => void
}

export const ArgumentBuilder = forwardRef<ArgumentBuilderHandle, ArgumentBuilderProps>(
  function ArgumentBuilder({ points, onAddPoint, className }: ArgumentBuilderProps, ref) {
    const [desc, setDesc] = useState('')
    const [type, setType] = useState('Achievement')
    const [resetCounter, setResetCounter] = useState(0)
    const maxReached = points.length >= NEGOTIATION_MAX_POINTS

    const handleAdd = useCallback(() => {
      if (!desc.trim() || maxReached) return
      onAddPoint({ description: desc.trim(), type })
      setDesc('')
      setResetCounter(prev => prev + 1)
    }, [desc, maxReached, onAddPoint, type])

    useImperativeHandle(
      ref,
      () => ({
        addCurrent: handleAdd,
      }),
      [handleAdd],
    )

    return (
      <Card
        padding="none"
        className={`min-h-0 overflow-visible md:min-h-[420px] ${className ?? ''}`.trim()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] bg-[var(--surface-subtle)] px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
            <Icon name="lightbulb" className="text-orange-500" />
            {TEXT.negotiation.argumentBuilderTitle}
          </h2>
        </div>

        {/* Input Section */}
        <div className="flex-shrink-0 space-y-2 bg-[var(--surface-light)] p-3">
          <div className="space-y-2">
            <Select
              value={type}
              onChange={value => {
                setType(value)
                setResetCounter(prev => prev + 1)
              }}
              className="w-full"
              leftIcon="category"
              placement="down"
            >
              {NEGOTIATION_POINT_TYPES.map(t => (
                <SelectOption key={t.value} value={t.value}>
                  {t.label}
                </SelectOption>
              ))}
            </Select>
          </div>
          <AIAssistedField
            value={desc}
            onChange={setDesc}
            pointType={type}
            placeholder={TEXT.negotiation.keyPointPlaceholder}
            resetSignal={resetCounter}
          />
          {maxReached ? (
            <p className="text-xs text-[var(--text-muted)]">{TEXT.negotiation.maxPointsWarning}</p>
          ) : null}
        </div>

        <div className="border-t border-[var(--border-light)] bg-[var(--surface-subtle)] p-3">
          <Button
            variant="success"
            className="w-full"
            disabled={!desc.trim() || maxReached}
            onClick={handleAdd}
          >
            <Icon name="add" size="sm" />
            {TEXT.negotiation.addArgument}
          </Button>
        </div>
      </Card>
    )
  },
)
