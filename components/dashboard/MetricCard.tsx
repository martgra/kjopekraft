interface MetricCardProps {
  title: string | React.ReactNode
  value: string | number
  suffix?: string
  trend?: {
    value: string
    label: string
    isPositive: boolean
  }
  icon: string
  iconColor?: 'green' | 'blue' | 'indigo' | 'orange' | 'emerald'
}

const iconColorClasses = {
  green: 'text-[var(--primary)] bg-[var(--color-green-100)]',
  blue: 'text-[var(--secondary)] bg-[var(--color-blue-100)]',
  indigo: 'text-[var(--color-indigo-500)] bg-indigo-50',
  orange: 'text-[var(--color-orange-500)] bg-orange-50',
  emerald: 'text-[var(--color-emerald-500)] bg-emerald-50',
}

export default function MetricCard({
  title,
  value,
  suffix,
  trend,
  icon,
  iconColor = 'green',
}: MetricCardProps) {
  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm transition-all hover:border-[var(--primary)]/50 sm:gap-4 sm:p-6">
      {/* Header with Icon */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[var(--text-muted)] sm:text-sm">{title}</p>
        <span
          className={`material-symbols-outlined shrink-0 rounded-md p-1.5 text-lg ${iconColorClasses[iconColor]}`}
        >
          {icon}
        </span>
      </div>

      {/* Value */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-[var(--text-main)] sm:text-3xl">
            {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
          </p>
          {suffix && <span className="text-sm font-medium text-[var(--text-muted)]">{suffix}</span>}
        </div>

        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <span
              className={`flex items-center font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}
            >
              <span className="material-symbols-outlined text-sm">
                {trend.isPositive ? 'trending_up' : 'trending_down'}
              </span>
              {trend.value}
            </span>
            <span className="ml-1 text-[var(--text-muted)]">{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
