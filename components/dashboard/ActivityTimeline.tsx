import type { PayPoint } from '@/lib/models/salary'

interface ActivityTimelineProps {
  payPoints: PayPoint[]
}

interface ActivityItem {
  id: string
  type: 'salary_added'
  year: number
  amount: number
  date: string
}

function generateActivityItems(payPoints: PayPoint[]): ActivityItem[] {
  // Sort by year descending and take the last 5
  const sortedPoints = [...payPoints].sort((a, b) => b.year - a.year).slice(0, 5)

  return sortedPoints.map(point => ({
    id: point.id || `${point.year}-${point.pay}`,
    type: 'salary_added' as const,
    year: point.year,
    amount: point.pay,
    // Mock date - in a real app, you'd store this
    date: `${point.year}`,
  }))
}

function formatRelativeTime(year: number): string {
  const currentYear = new Date().getFullYear()
  const diff = currentYear - year

  if (diff === 0) return 'This year'
  if (diff === 1) return 'Last year'
  return `${diff} years ago`
}

export default function ActivityTimeline({ payPoints }: ActivityTimelineProps) {
  const activities = generateActivityItems(payPoints)

  if (activities.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-main)]">Recent Activity</h3>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          No activity yet. Add your first salary point to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--text-main)]">Recent Activity</h3>
        <a href="#" className="text-xs font-bold text-[var(--primary)] hover:text-blue-600">
          View All
        </a>
      </div>

      <div className="flex flex-col gap-4">
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1
          return (
            <div key={activity.id} className="flex items-start gap-3">
              {/* Timeline Dot */}
              <div className="relative mt-1">
                <div className="size-2 rounded-full bg-[var(--primary)] ring-4 ring-white"></div>
                {!isLast && (
                  <div className="absolute top-2 left-1 -z-10 h-full w-px bg-gray-200"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1 pb-2">
                <p className="text-sm font-bold text-[var(--text-main)]">Salary Added</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatRelativeTime(activity.year)}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                    + {activity.amount.toLocaleString('nb-NO')} pts
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
