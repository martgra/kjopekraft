'use client'

import { Icon, Badge } from '@/components/ui/atoms'
import { cn } from '@/lib/utils/cn'

export interface PointItemProps {
  index: number
  type: string
  description: string
  onRemove: () => void
  className?: string
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Achievement: { bg: 'bg-green-100', text: 'text-green-600' },
  Experience: { bg: 'bg-blue-100', text: 'text-blue-600' },
  'Market Data': { bg: 'bg-purple-100', text: 'text-purple-600' },
  Responsibility: { bg: 'bg-orange-100', text: 'text-orange-600' },
  Certification: { bg: 'bg-teal-100', text: 'text-teal-600' },
}

export function PointItem({ index, type, description, onRemove, className }: PointItemProps) {
  const colors = TYPE_COLORS[type] || TYPE_COLORS.Achievement

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-2.5',
        'shadow-sm transition-colors hover:border-blue-300',
        className
      )}
    >
      {/* Index Badge */}
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
          'text-[10px] font-bold',
          colors.bg,
          colors.text
        )}
      >
        {index + 1}
      </span>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <Badge variant="default" size="sm" className={cn(colors.bg, colors.text, 'mb-1')}>
          {type}
        </Badge>
        <p className="text-sm leading-snug break-words text-[var(--text-main)]">{description}</p>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
        aria-label="Fjern punkt"
      >
        <Icon name="close" size="sm" />
      </button>
    </div>
  )
}
