'use client'

import React, { cloneElement, isValidElement, useId, useState } from 'react'
import { cn } from '@/lib/utils/cn'

type TooltipSide = 'top' | 'bottom' | 'left' | 'right'
type TooltipAlign = 'start' | 'center' | 'end'

export interface InfoTooltipProps {
  label: React.ReactNode
  className?: string
  iconName?: 'info' | 'help'
  side?: TooltipSide
  align?: TooltipAlign
  maxWidth?: number
  asChild?: boolean
  children?: React.ReactElement<React.HTMLAttributes<HTMLElement>>
}

function combineHandlers<T extends React.SyntheticEvent>(
  existing?: (event: T) => void,
  next?: (event: T) => void,
) {
  return (event: T) => {
    existing?.(event)
    if (!event.defaultPrevented) {
      next?.(event)
    }
  }
}

function getPositionClasses(side: TooltipSide, align: TooltipAlign) {
  const base = {
    top: 'bottom-full -translate-y-2',
    bottom: 'top-full translate-y-2',
    left: 'right-full -translate-x-2',
    right: 'left-full translate-x-2',
  }[side]

  const alignment = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center:
      side === 'top' || side === 'bottom'
        ? 'left-1/2 -translate-x-1/2'
        : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  }[align]

  return cn('absolute z-50', base, alignment)
}

export function InfoTooltip({
  label,
  className,
  iconName = 'info',
  side = 'top',
  align = 'center',
  maxWidth = 240,
  asChild = false,
  children,
}: InfoTooltipProps) {
  const tooltipId = useId()
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const triggerProps = {
    onMouseEnter: handleOpen,
    onMouseLeave: handleClose,
    onFocus: handleOpen,
    onBlur: handleClose,
    'aria-describedby': open ? tooltipId : undefined,
  }

  let trigger: React.ReactElement

  if (asChild) {
    if (!children || !isValidElement(children)) {
      throw new Error('InfoTooltip with asChild requires a single React element child.')
    }

    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>
    const ariaDescribedBy = [
      child.props['aria-describedby' as keyof React.HTMLAttributes<HTMLElement>],
      triggerProps['aria-describedby'],
    ]
      .filter(Boolean)
      .join(' ')

    trigger = cloneElement(child, {
      ...child.props,
      onMouseEnter: combineHandlers(child.props.onMouseEnter, triggerProps.onMouseEnter),
      onMouseLeave: combineHandlers(child.props.onMouseLeave, triggerProps.onMouseLeave),
      onFocus: combineHandlers(child.props.onFocus, triggerProps.onFocus),
      onBlur: combineHandlers(child.props.onBlur, triggerProps.onBlur),
      'aria-describedby': ariaDescribedBy || undefined,
    })
  } else {
    trigger = (
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        {...triggerProps}
      >
        <span className="material-symbols-outlined text-[16px]">{iconName}</span>
      </button>
    )
  }

  return (
    <span className={cn('relative inline-flex items-center', className)}>
      {trigger}
      <span
        role="tooltip"
        id={tooltipId}
        className={cn(
          'pointer-events-none rounded-md border border-[var(--border-light)] bg-white px-3 py-2 text-xs text-[var(--text-main)] shadow-lg transition-all duration-150 ease-out select-none',
          open ? 'blur-0 opacity-100' : 'translate-y-1 opacity-0 blur-[1px]',
          getPositionClasses(side, align),
        )}
        style={{ maxWidth }}
      >
        {label}
      </span>
    </span>
  )
}

export default InfoTooltip
