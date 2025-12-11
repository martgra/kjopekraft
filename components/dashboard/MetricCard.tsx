interface MetricCardProps {
  title: string
  value: string | number
  suffix?: string
  trend?: {
    value: string
    label: string
    isPositive: boolean
  }
  icon: string
}

export default function MetricCard({ title, value, suffix, trend, icon }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--text-muted)]">{title}</p>
        <span className="material-symbols-outlined text-[24px] text-[var(--primary)]">{icon}</span>
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
          {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
          {suffix && (
            <span className="ml-1 text-lg font-medium text-[var(--text-muted)]">{suffix}</span>
          )}
        </p>

        {/* Trend */}
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            <span
              className={`material-symbols-outlined text-[18px] ${trend.isPositive ? 'text-[#078838]' : 'text-red-600'}`}
            >
              {trend.isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <p
              className={`text-sm font-bold ${trend.isPositive ? 'text-[#078838]' : 'text-red-600'}`}
            >
              {trend.value}{' '}
              <span className="ml-1 text-xs font-medium text-[var(--text-muted)]">
                {trend.label}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
