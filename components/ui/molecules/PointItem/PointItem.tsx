'use client'

import { Icon, Badge } from '@/components/ui/atoms'
import { cn } from '@/lib/utils/cn'
import { TEXT } from '@/lib/constants/text'
import {
  NEGOTIATION_POINT_TYPE_LABELS,
  normalizeNegotiationPointType,
} from '@/lib/negotiation/pointTypes'
import InfoTooltip from '@/components/ui/atoms/InfoTooltip'

export interface PointItemProps {
  index: number
  type: string
  description: string
  onRemove: () => void
  onEdit?: () => void
  className?: string
  descriptionClassName?: string
}

const DEFAULT_COLORS = {
  bg: 'bg-[var(--surface-subtle)]',
  text: 'text-[var(--primary)]',
} as const

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Achievement: DEFAULT_COLORS,
  Responsibility: { bg: 'bg-[var(--surface-subtle)]', text: 'text-[var(--accent)]' },
  Market: { bg: 'bg-[var(--surface-subtle)]', text: 'text-[var(--secondary)]' },
  Competence: { bg: 'bg-[var(--surface-subtle)]', text: 'text-[var(--color-indigo-500)]' },
  Other: { bg: 'bg-[var(--surface-subtle)]', text: 'text-[var(--text-muted)]' },
}

export function PointItem({
  index,
  type,
  description,
  onRemove,
  onEdit,
  className,
  descriptionClassName,
}: PointItemProps) {
  const normalizedType = normalizeNegotiationPointType(type)
  const colors = TYPE_COLORS[normalizedType] ?? DEFAULT_COLORS
  const typeLabel = NEGOTIATION_POINT_TYPE_LABELS[normalizedType] || type

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-2.5',
        'shadow-sm transition-colors hover:border-[var(--primary)]/40',
        className,
      )}
    >
      {/* Index Badge */}
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
          'text-[10px] font-bold',
          colors.bg,
          colors.text,
        )}
      >
        {index + 1}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <Badge variant="default" size="sm" className={cn(colors.bg, colors.text, 'mb-1')}>
          {typeLabel}
        </Badge>
        <p
          className={cn(
            'text-sm leading-snug break-words text-[var(--text-main)]',
            descriptionClassName,
          )}
          title={description}
        >
          {description}
        </p>
      </div>

      {/* Action Buttons - Always visible on mobile, hover-reveal on desktop */}
      <div className="flex flex-shrink-0 gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
        {onEdit && (
          <InfoTooltip label={TEXT.common.edit} asChild>
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--secondary)] active:bg-[var(--surface-subtle)] md:p-1"
              aria-label={TEXT.common.edit}
            >
              <Icon name="edit" size="sm" />
            </button>
          </InfoTooltip>
        )}
        <InfoTooltip label={TEXT.common.remove} asChild>
          <button
            onClick={onRemove}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:text-red-500 active:bg-[var(--surface-subtle)] md:p-1"
            aria-label="Fjern punkt"
          >
            <Icon name="close" size="sm" />
          </button>
        </InfoTooltip>
      </div>
    </div>
  )
}
