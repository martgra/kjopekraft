import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, subtitle, actions, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between',
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[var(--text-main)] md:text-3xl">{title}</h1>
          {subtitle ? <p className="text-sm text-[var(--text-muted)] md:mt-1">{subtitle}</p> : null}
        </div>
        {actions ? <div className="mt-2 sm:mt-0">{actions}</div> : null}
      </div>
    )
  },
)

SectionHeader.displayName = 'SectionHeader'
