import type { PayPoint } from '@/lib/models/types'
import { TEXT } from '@/lib/constants/text'

interface ActivityTimelineProps {
  payPoints: PayPoint[]
  onEdit?: (point: PayPoint) => void
  onRemove?: (year: number, pay: number) => void
}

function formatRelativeTime(year: number): string {
  const currentYear = new Date().getFullYear()
  const diff = currentYear - year

  if (diff === 0) return `${TEXT.activity.thisYear} (${year})`
  if (diff === 1) return `${TEXT.activity.lastYear} (${year})`
  return `${TEXT.activity.yearsAgo.replace('{count}', String(diff))} (${year})`
}

export default function ActivityTimeline({ payPoints, onEdit, onRemove }: ActivityTimelineProps) {
  // Sort by year descending and take the last 5
  const recentPoints = [...payPoints].sort((a, b) => b.year - a.year).slice(0, 5)

  if (recentPoints.length === 0) {
    return (
      <div className="p-6">
        <h3 className="mb-4 text-base font-bold text-[var(--text-main)]">
          {TEXT.activity.recentActivity}
        </h3>
        <p className="text-sm text-[var(--text-muted)]">{TEXT.activity.noActivityYet}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <h3 className="mb-4 text-base font-bold text-[var(--text-main)]">
        {TEXT.activity.recentActivity}
      </h3>

      <div className="flex flex-col gap-4">
        {recentPoints.map((point, index) => {
          const isLast = index === recentPoints.length - 1
          return (
            <div key={point.id || `${point.year}-${point.pay}`} className="flex items-start gap-3">
              {/* Timeline Dot */}
              <div className="relative mt-1">
                <div className="size-2 rounded-full bg-[var(--primary)] ring-4 ring-white"></div>
                {!isLast && (
                  <div className="absolute top-2 left-1 -z-10 h-full w-px bg-gray-200"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-1 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-[var(--text-main)]">
                      {TEXT.activity.salaryAdded}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatRelativeTime(point.year)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                        + {point.pay.toLocaleString('nb-NO')} {TEXT.common.pts}
                      </span>
                    </div>
                  </div>
                  {(onEdit || onRemove) && (
                    <div className="flex gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(point)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--primary)]"
                          title={TEXT.common.edit}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                      )}
                      {onRemove && (
                        <button
                          onClick={() => onRemove(point.year, point.pay)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-red-100 hover:text-red-600"
                          title={TEXT.common.remove}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
