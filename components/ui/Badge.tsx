'use client'

import React from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary'
export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  success: 'bg-success-light text-success-700 border-success-200',
  warning: 'bg-warning-light text-warning-700 border-warning-200',
  danger: 'bg-danger-light text-danger-700 border-danger-200',
  primary: 'bg-primary-light text-primary-700 border-primary-200',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className} `}
    >
      {children}
    </span>
  )
}
