import type { PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'

interface ActivityTimelineProps {
  payPoints: PayPoint[]
  onEdit?: (point: PayPoint) => void
  onRemove?: (year: number, pay: number) => void
  currentYear: number
}

function formatRelativeTime(year: number, currentYear: number): string {
  const diff = currentYear - year

  if (diff === 0) return TEXT.activity.thisYear
  if (diff === 1) return TEXT.activity.lastYear

  // Handle both function and template string formats
  const yearsAgo = TEXT.activity.yearsAgo
  if (typeof yearsAgo === 'function') {
    return yearsAgo(diff)
  }
  // Fallback for string template
  return `${diff} år siden`
}

export default function ActivityTimeline({
  payPoints,
  onEdit,
  onRemove,
  currentYear,
}: ActivityTimelineProps) {
  // Sort by year descending and take the last 5
  const recentPoints = [...payPoints].sort((a, b) => b.year - a.year).slice(0, 5)

  if (recentPoints.length === 0) {
    return (
      <div className="p-6">
        <h3 className="mb-4 font-bold text-[var(--text-main)]">{TEXT.activity.recentActivity}</h3>
        <p className="text-sm text-[var(--text-muted)]">{TEXT.activity.noActivityYet}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h3 className="mb-4 font-bold text-[var(--text-main)]">{TEXT.activity.recentActivity}</h3>

      <div className="relative space-y-6">
        {/* Vertical Timeline Line */}
        <div className="absolute top-2 bottom-2 left-1.5 w-0.5 bg-gray-200"></div>

        {recentPoints.map(point => (
          <div key={point.id || `${point.year}-${point.pay}`} className="group relative pl-6">
            {/* Timeline Dot */}
            <div className="absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[var(--primary)]"></div>

            {/* Content */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-main)]">
                  {TEXT.activity.salaryAdded}
                </p>
                <p className="mb-1 text-xs text-[var(--text-muted)]">
                  {formatRelativeTime(point.year, currentYear)} ({point.year})
                </p>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                  + {point.pay.toLocaleString('nb-NO')} {TEXT.common.pts}
                </span>
              </div>

              {/* Action Buttons - Always visible on mobile, hover-reveal on desktop */}
              {(onEdit || onRemove) && (
                <div className="flex gap-2 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(point)}
                      className="rounded-lg p-2 text-gray-400 hover:text-blue-600 active:bg-gray-100 md:p-1"
                      title={TEXT.common.edit}
                      aria-label={TEXT.common.edit}
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => onRemove(point.year, point.pay)}
                      className="rounded-lg p-2 text-gray-400 hover:text-red-500 active:bg-gray-100 md:p-1"
                      title={TEXT.common.remove}
                      aria-label={TEXT.common.remove}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
