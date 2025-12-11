import { cn } from '@/lib/utils/cn'

export interface IconProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  filled?: boolean
}

const sizes = {
  xs: 'text-[12px]',
  sm: 'text-[16px]',
  md: 'text-[20px]',
  lg: 'text-[24px]',
  xl: 'text-[32px]',
}

export function Icon({ name, size = 'md', className, filled }: IconProps) {
  return (
    <span
      className={cn(
        'material-symbols-outlined',
        sizes[size],
        filled && 'font-variation-settings-fill',
        className
      )}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}
