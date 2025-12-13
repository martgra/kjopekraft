'use client'

import { cn } from '@/lib/utils/cn'
import { useState, useRef, useEffect } from 'react'
import { Children, isValidElement } from 'react'

export interface SelectOptionProps {
  value: string
  children: React.ReactNode
}

export function SelectOption({ value, children }: SelectOptionProps) {
  // This is just a placeholder component for type safety
  // It won't actually render - the parent Select extracts its props
  return null
}

export interface SelectProps {
  children: React.ReactNode
  className?: string
  leftIcon?: string
  rightIcon?: string
  id?: string
  value?: string
  onChange?: (value: string) => void
}

export function Select({
  children,
  className,
  leftIcon,
  rightIcon = 'expand_more',
  id,
  value,
  onChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use controlled value from props
  const selectedValue = value || ''

  // Extract options from children - support both SelectOption and native option elements
  const childrenArray = Children.toArray(children)
  const options = childrenArray.filter(child => {
    // Accept both our SelectOption component and native option elements
    if (isValidElement(child)) {
      return child.type === SelectOption || child.type === 'option'
    }
    return false
  })

  const selectedOption = options.find(child => {
    if (isValidElement<SelectOptionProps>(child)) {
      return child.props.value === selectedValue
    }
    return false
  })

  const selectedLabel = isValidElement<SelectOptionProps>(selectedOption)
    ? selectedOption.props.children
    : 'Select...'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    setIsOpen(false)
    onChange?.(optionValue)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-[var(--border-light)] bg-white py-2.5 text-base font-medium text-gray-900',
          'shadow-sm transition-all',
          'hover:border-gray-400 hover:shadow',
          'focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 focus:outline-none',
          'active:scale-[0.99]',
          leftIcon ? 'pl-10' : 'pl-3',
          'pr-9',
          className,
        )}
      >
        {leftIcon && (
          <span className="material-symbols-outlined absolute left-3 text-lg text-gray-500">
            {leftIcon}
          </span>
        )}
        <span className="flex-1 text-left">{selectedLabel}</span>
        <span
          className={cn(
            'material-symbols-outlined text-xl text-gray-400 transition-transform',
            isOpen && 'rotate-180',
          )}
        >
          {rightIcon}
        </span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full z-50 mb-1 w-full rounded-lg border border-[var(--border-light)] bg-white shadow-lg">
          <div className="max-h-60 overflow-auto py-1">
            {options.map((child, index) => {
              if (!isValidElement<SelectOptionProps>(child)) return null

              const optionValue = child.props.value
              const optionLabel = child.props.children
              const isSelected = optionValue === selectedValue

              return (
                <button
                  key={optionValue || index}
                  type="button"
                  onClick={() => handleSelect(optionValue)}
                  className={cn(
                    'w-full px-3 py-2.5 text-left text-base transition-colors',
                    isSelected
                      ? 'bg-[var(--primary)]/10 font-medium text-[var(--primary)]'
                      : 'text-gray-900 hover:bg-gray-50',
                  )}
                >
                  {optionLabel}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
