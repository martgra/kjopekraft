import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

type NoticeVariant = 'info' | 'warning' | 'error' | 'success'

interface NoticeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: NoticeVariant
}

const variants: Record<NoticeVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200',
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200',
}

export const Notice = forwardRef<HTMLDivElement, NoticeProps>(
  ({ variant = 'info', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border px-3 py-2 text-xs font-medium',
          variants[variant],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)

Notice.displayName = 'Notice'
