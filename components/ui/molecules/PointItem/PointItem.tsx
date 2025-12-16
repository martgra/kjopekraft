'use client'

import { Icon, Badge } from '@/components/ui/atoms'
import { cn } from '@/lib/utils/cn'
import { TEXT } from '@/lib/constants/text'
import InfoTooltip from '@/components/ui/atoms/InfoTooltip'

export interface PointItemProps {
  index: number
  type: string
  description: string
  onRemove: () => void
  onEdit?: () => void
  className?: string
}

const DEFAULT_COLORS = { bg: 'bg-green-100', text: 'text-green-600' } as const

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Achievement: DEFAULT_COLORS,
  Experience: { bg: 'bg-blue-100', text: 'text-blue-600' },
  'Market Data': { bg: 'bg-purple-100', text: 'text-purple-600' },
  Responsibility: { bg: 'bg-orange-100', text: 'text-orange-600' },
  Certification: { bg: 'bg-teal-100', text: 'text-teal-600' },
}

// Map English type values to Norwegian labels
const TYPE_LABELS: Record<string, string> = {
  Achievement: TEXT.negotiation.typeAchievement,
  Experience: TEXT.negotiation.typeExperience,
  'Market Data': TEXT.negotiation.typeMarket,
  Responsibility: TEXT.negotiation.typeResponsibility,
  Certification: TEXT.negotiation.typeCertification,
}

export function PointItem({
  index,
  type,
  description,
  onRemove,
  onEdit,
  className,
}: PointItemProps) {
  const colors = TYPE_COLORS[type] ?? DEFAULT_COLORS
  const typeLabel = TYPE_LABELS[type] || type

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-gray-100 bg-[var(--surface-light)] p-2.5',
        'shadow-sm transition-colors hover:border-blue-300 dark:border-gray-700',
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
        <p className="text-sm leading-snug break-words text-[var(--text-main)]">{description}</p>
      </div>

      {/* Action Buttons - Always visible on mobile, hover-reveal on desktop */}
      <div className="flex flex-shrink-0 gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
        {onEdit && (
          <InfoTooltip label={TEXT.common.edit} asChild>
            <button
              onClick={onEdit}
              className="rounded-lg p-2 text-gray-400 hover:text-blue-600 active:bg-gray-100 dark:active:bg-gray-700 md:p-1"
              aria-label={TEXT.common.edit}
            >
              <Icon name="edit" size="sm" />
            </button>
          </InfoTooltip>
        )}
        <InfoTooltip label={TEXT.common.remove} asChild>
          <button
            onClick={onRemove}
            className="rounded-lg p-2 text-gray-400 hover:text-red-500 active:bg-gray-100 dark:active:bg-gray-700 md:p-1"
            aria-label="Fjern punkt"
          >
            <Icon name="close" size="sm" />
          </button>
        </InfoTooltip>
      </div>
    </div>
  )
}
