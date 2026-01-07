'use client'

'use client'

import { Button, Card, CardContent, CardHeader, CardTitle, Icon } from '@/components/ui/atoms'
import { PointItem } from '@/components/ui/molecules'
import { useDrawer } from '@/contexts/drawer/DrawerContext'
import { TEXT } from '@/lib/constants/text'
import type { NegotiationPoint } from '@/lib/schemas/negotiation'

interface NegotiationArgumentsProps {
  points: NegotiationPoint[]
  onRemovePoint: (index: number) => void
}

export function NegotiationArguments({ points, onRemovePoint }: NegotiationArgumentsProps) {
  const { openDrawer } = useDrawer()

  const isEmpty = points.length === 0

  return (
    <Card>
      {!isEmpty ? (
        <CardHeader>
          <CardTitle>{TEXT.negotiation.argumentsTitle}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border-light)] bg-[var(--surface-subtle)] px-4 py-6 text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openDrawer}
              aria-label={TEXT.negotiation.openArgumentBuilder}
              className="h-12 w-12 rounded-full p-0"
            >
              <Icon name="playlist_add" size="lg" className="text-[var(--text-muted)]" />
            </Button>
            <p className="text-sm text-[var(--text-muted)]">{TEXT.negotiation.noPointsYet}</p>
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
