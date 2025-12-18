'use client'

import { Card, Badge, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import type { NegotiationPoint } from '@/components/ui/organisms'
import { NEGOTIATION_POINT_TYPE_LABELS, NEGOTIATION_MAX_POINTS } from '@/lib/negotiation/pointTypes'
import { cn } from '@/lib/utils/cn'

type Suggestion = {
  id: string
  type: string
  text: string
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'responsibility',
    type: 'Responsibility',
    text: TEXT.negotiationSuggestions.items.responsibility,
  },
  {
    id: 'results',
    type: 'Achievement',
    text: TEXT.negotiationSuggestions.items.results,
  },
  {
    id: 'skills',
    type: 'Competence',
    text: TEXT.negotiationSuggestions.items.skills,
  },
  {
    id: 'loyalty',
    type: 'Other',
    text: TEXT.negotiationSuggestions.items.loyalty,
  },
  {
    id: 'projects',
    type: 'Achievement',
    text: TEXT.negotiationSuggestions.items.projects,
  },
  {
    id: 'growth',
    type: 'Competence',
    text: TEXT.negotiationSuggestions.items.growth,
  },
]

export interface NegotiationSuggestionsProps {
  points: NegotiationPoint[]
  onAddPoint: (point: NegotiationPoint) => void
}

export function NegotiationSuggestions({ points, onAddPoint }: NegotiationSuggestionsProps) {
  const maxReached = points.length >= NEGOTIATION_MAX_POINTS

  const handleAdd = (suggestion: Suggestion) => {
    if (maxReached) return
    const alreadyAdded = points.some(point => point.description === suggestion.text)
    if (alreadyAdded) return
    onAddPoint({ description: suggestion.text, type: suggestion.type })
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
          <Icon name="task_alt" size="md" className="text-[var(--primary)]" />
          {TEXT.negotiationSuggestions.title}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {TEXT.negotiationSuggestions.subtitle}
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {SUGGESTIONS.map(suggestion => {
          const alreadyAdded = points.some(point => point.description === suggestion.text)
          const isDisabled = alreadyAdded || maxReached
          const typeLabel = NEGOTIATION_POINT_TYPE_LABELS[suggestion.type] ?? suggestion.type ?? ''
          return (
            <label
              key={suggestion.id}
              className={cn(
                'flex cursor-pointer gap-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2 text-left text-sm text-[var(--text-main)] shadow-sm transition-colors hover:border-[var(--primary)]/40',
                isDisabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--primary)]"
                checked={alreadyAdded}
                disabled={isDisabled}
                onChange={() => handleAdd(suggestion)}
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant="default"
                    size="sm"
                    className="bg-[var(--surface-subtle)] text-[var(--text-main)]"
                  >
                    {typeLabel}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)]">
                    {alreadyAdded
                      ? TEXT.negotiationSuggestions.addedLabel
                      : TEXT.negotiationSuggestions.addLabel}
                  </span>
                </div>
                <span className="block">{suggestion.text}</span>
              </div>
            </label>
          )
        })}
      </div>

      {maxReached ? (
        <p className="text-xs text-[var(--text-muted)]">{TEXT.negotiation.maxPointsWarning}</p>
      ) : null}
    </Card>
  )
}
