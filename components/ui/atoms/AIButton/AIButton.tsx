'use client'

import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from '../Button'
import { Icon } from '../Icon'

export interface AIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function AIButton({ label, className, ...props }: AIButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        'relative w-full overflow-hidden border border-amber-300/70 bg-amber-50 text-amber-900',
        'hover:border-amber-300 hover:bg-amber-100/80',
        'dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-100',
        'dark:hover:border-amber-400/70 dark:hover:bg-amber-500/20',
        'shadow-[0_0_0_1px_rgba(251,191,36,0.15),0_10px_24px_rgba(251,146,60,0.25)]',
        'dark:shadow-[0_0_0_1px_rgba(251,191,36,0.1),0_12px_28px_rgba(248,113,113,0.25)]',
        'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r',
        'before:from-amber-200/80 before:via-orange-200/40 before:to-rose-200/60',
        'before:opacity-80 before:content-[""]',
        'dark:before:from-amber-500/30 dark:before:via-orange-500/15 dark:before:to-rose-500/25',
        'after:absolute after:inset-0 after:-translate-x-[120%] after:rounded-lg after:bg-gradient-to-r',
        'after:from-transparent after:via-white/60 after:to-transparent after:opacity-70',
        'dark:after:via-amber-100/40',
        'after:animate-[aiShimmer_2.6s_ease-in-out_infinite] after:content-[""]',
        'disabled:after:animate-none disabled:after:opacity-0',
        className,
      )}
      {...props}
    >
      <span className="relative flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm dark:bg-amber-400">
          <Icon name="auto_awesome" size="sm" />
        </span>
        <span>{label}</span>
      </span>
      <style jsx>{`
        @keyframes aiShimmer {
          0% {
            transform: translateX(-120%);
          }
          60% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
      `}</style>
    </Button>
  )
}
