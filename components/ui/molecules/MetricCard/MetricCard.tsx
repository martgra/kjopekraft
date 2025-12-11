import { Card, CardHeader, CardTitle, CardContent, Icon } from '@/components/ui/atoms'
import { cn } from '@/lib/utils/cn'

export interface MetricCardProps {
  title: string
  value: string | number
  suffix?: string
  trend?: {
    value: string
    label: string
    isPositive: boolean
  }
  icon: string
  className?: string
}

export function MetricCard({ title, value, suffix, trend, icon, className }: MetricCardProps) {
  return (
    <Card variant="default" interactive className={cn('hover:shadow-md', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <Icon name={icon} size="lg" className="text-[var(--primary)]" />
      </CardHeader>

      <CardContent className="mt-2">
        <p className="text-3xl font-bold tracking-tight text-[var(--text-main)]">
          {typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
          {suffix && (
            <span className="ml-1 text-lg font-medium text-[var(--text-muted)]">{suffix}</span>
          )}
        </p>

        {trend && (
          <div className="mt-1 flex items-center gap-1">
            <Icon
              name={trend.isPositive ? 'trending_up' : 'trending_down'}
              size="sm"
              className={trend.isPositive ? 'text-green-600' : 'text-red-600'}
            />
            <span
              className={cn(
                'text-sm font-bold',
                trend.isPositive ? 'text-green-600' : 'text-red-600',
              )}
            >
              {trend.value}
            </span>
            <span className="ml-1 text-xs text-[var(--text-muted)]">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
