import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ModalShellProps extends HTMLAttributes<HTMLDivElement> {
  onClose?: () => void
  backdropClassName?: string
  wrapperClassName?: string
  children: ReactNode
}

export const ModalShell = forwardRef<HTMLDivElement, ModalShellProps>(
  ({ onClose, backdropClassName, wrapperClassName, className, children, ...props }, ref) => {
    return (
      <>
        <div
          className={cn('fixed inset-0 z-40 bg-black/60 backdrop-blur-sm', backdropClassName)}
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={cn(
            'pointer-events-none fixed inset-0 z-[60] flex items-center justify-center px-4',
            wrapperClassName,
          )}
        >
          <div
            ref={ref}
            className={cn(
              'pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-[var(--radius-modal)] bg-[var(--surface-light)] shadow-[var(--shadow-strong)]',
              className,
            )}
            onClick={event => event.stopPropagation()}
            {...props}
          >
            {children}
          </div>
        </div>
      </>
    )
  },
)

ModalShell.displayName = 'ModalShell'
