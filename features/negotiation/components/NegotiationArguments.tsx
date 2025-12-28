'use client'

import { Card, CardContent, CardHeader, CardTitle, Icon } from '@/components/ui/atoms'
import { PointItem } from '@/components/ui/molecules'
import { TEXT } from '@/lib/constants/text'
import type { NegotiationPoint } from '@/lib/schemas/negotiation'

interface NegotiationArgumentsProps {
  points: NegotiationPoint[]
  onRemovePoint: (index: number) => void
}

export function NegotiationArguments({ points, onRemovePoint }: NegotiationArgumentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{TEXT.negotiation.argumentsTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-light)] bg-[var(--surface-subtle)] px-4 py-6 text-center">
            <Icon name="playlist_add" size="lg" className="text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">{TEXT.negotiation.noPointsYet}</p>
            <p className="text-xs text-[var(--text-muted)]">{TEXT.negotiation.addPointsHint}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {points.map((point, index) => (
              <PointItem
                key={`${point.type}-${index}`}
                index={index}
                type={point.type}
                description={point.description}
                descriptionClassName="line-clamp-2"
                onRemove={() => onRemovePoint(index)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
