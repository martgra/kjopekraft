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
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-3 sm:p-5 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-xs leading-tight font-medium text-[var(--text-muted)] sm:text-sm">
          {title}
        </p>
        <span className="material-symbols-outlined shrink-0 text-[20px] text-[var(--primary)] sm:text-[22px] md:text-[24px]">
          {icon}
        </span>
      </div>

      {/* Value */}
      <div>
        <p className="text-2xl font-bold tracking-tight break-words text-[var(--text-main)] sm:text-3xl md:text-3xl">
          {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
          {suffix && (
            <span className="ml-1 text-base font-medium text-[var(--text-muted)] sm:text-lg">
              {suffix}
            </span>
          )}
        </p>

        {/* Trend */}
        {trend && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <span
              className={`material-symbols-outlined text-[16px] sm:text-[18px] ${trend.isPositive ? 'text-[#078838]' : 'text-red-600'}`}
            >
              {trend.isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <p
              className={`text-xs font-bold sm:text-sm ${trend.isPositive ? 'text-[#078838]' : 'text-red-600'}`}
            >
              {trend.value}{' '}
              <span className="ml-1 text-[10px] font-medium text-[var(--text-muted)] sm:text-xs">
                {trend.label}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
