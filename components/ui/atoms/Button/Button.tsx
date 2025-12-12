import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from '../Icon'
import { Spinner } from '../Spinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
}

const variants = {
  primary: 'bg-[var(--primary)] text-white hover:opacity-90 shadow-sm',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-[var(--border-light)]',
  ghost: 'bg-transparent text-[var(--text-main)] hover:bg-gray-100',
  danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  success: 'bg-green-500 text-white hover:bg-green-600 shadow-sm',
}

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs gap-1',
  md: 'px-3.5 py-2 text-sm gap-1.5',
  lg: 'px-5 py-2.5 text-base gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      icon,
      iconPosition = 'left',
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-all duration-150 ease-in-out',
          'focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Spinner size="sm" className="border-current border-t-transparent" />}
        {!loading && icon && iconPosition === 'left' && (
          <Icon name={icon} size={size === 'lg' ? 'md' : 'sm'} />
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <Icon name={icon} size={size === 'lg' ? 'md' : 'sm'} />
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
