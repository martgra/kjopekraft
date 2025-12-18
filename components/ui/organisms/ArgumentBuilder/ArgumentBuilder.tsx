'use client'

import { useState } from 'react'
import { Card, Button, Input, Icon } from '@/components/ui/atoms'
import { PointItem } from '@/components/ui/molecules'
import { TEXT } from '@/lib/constants/text'
import { NEGOTIATION_MAX_POINTS, NEGOTIATION_POINT_TYPES } from '@/lib/negotiation/pointTypes'

export interface NegotiationPoint {
  description: string
  type: string
}

export interface ArgumentBuilderProps {
  points: NegotiationPoint[]
  onAddPoint: (point: NegotiationPoint) => void
  onRemovePoint: (index: number) => void
  onEditPoint?: (index: number) => void
  className?: string
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-8 text-center">
      <Icon name="playlist_add" size="xl" className="mb-2 text-[var(--text-muted)]" />
      <p className="text-sm text-[var(--text-muted)]">{TEXT.negotiation.noPointsYet}</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{TEXT.negotiation.addPointsHint}</p>
    </div>
  )
}

export function ArgumentBuilder({
  points,
  onAddPoint,
  onRemovePoint,
  onEditPoint,
  className,
}: ArgumentBuilderProps) {
  const [desc, setDesc] = useState('')
  const [type, setType] = useState('Achievement')
  const maxReached = points.length >= NEGOTIATION_MAX_POINTS

  const handleAdd = () => {
    if (!desc.trim() || maxReached) return
    onAddPoint({ description: desc.trim(), type })
    setDesc('')
  }

  const handleEdit = (index: number) => {
    // Pre-fill the form with the selected point's data
    const point = points[index]
    if (!point) return
    setDesc(point.description)
    setType(point.type)

    // Remove the point so user can edit and re-add it
    onRemovePoint(index)

    // Call the optional edit callback if provided
    if (onEditPoint) {
      onEditPoint(index)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <Card padding="none" className={className}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-[var(--border-light)] bg-[var(--surface-subtle)] px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
          <Icon name="lightbulb" className="text-orange-500" />
          {TEXT.negotiation.argumentBuilderTitle}
        </h2>
      </div>

      {/* Input Section */}
      <div className="flex-shrink-0 space-y-2 bg-[var(--surface-light)] p-3">
        <div className="flex gap-2">
          <select
            className="w-[35%] rounded-md border border-[var(--border-light)] bg-[var(--surface-subtle)] py-2 text-base text-[var(--text-main)] focus:ring-1 focus:ring-[var(--primary)]"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            {NEGOTIATION_POINT_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Input
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder={TEXT.negotiation.keyPointPlaceholder}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
        </div>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleAdd}
          disabled={!desc.trim() || maxReached}
        >
          <Icon name="add" size="sm" />
          {TEXT.negotiation.addToList}
        </Button>
        {maxReached ? (
          <p className="text-xs text-[var(--text-muted)]">{TEXT.negotiation.maxPointsWarning}</p>
        ) : null}
      </div>

      {/* Points List */}
      <div className="flex-1 overflow-y-auto border-t border-[var(--border-light)] bg-[var(--surface-subtle)] px-4 py-2">
        {points.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {points.map((p, i) => (
              <PointItem
                key={i}
                index={i}
                type={p.type}
                description={p.description}
                onRemove={() => onRemovePoint(i)}
                onEdit={() => handleEdit(i)}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
