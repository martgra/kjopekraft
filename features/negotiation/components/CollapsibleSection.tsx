import React, { useState } from 'react'
import { Icon } from '@/components/ui/atoms'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultCollapsed?: boolean
  collapseLabel: string
  icon?: string
  actions?: React.ReactNode
}

export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  collapseLabel,
  icon = 'mail_outline',
  actions,
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-light)] bg-[var(--surface-light)] shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between bg-gray-50/50 p-4 transition-colors hover:bg-gray-50"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
        aria-controls={title.replace(/\s/g, '-') + '-section'}
      >
        <div className="flex items-center gap-2">
          <Icon name={icon} className="text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div className="text-primary flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--primary-hover)]">
          {collapseLabel}
          <Icon name={collapsed ? 'expand_more' : 'expand_less'} className="text-lg" />
        </div>
      </button>
      {actions && (
        <div className="border-t border-[var(--border-light)] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {actions}
          </div>
        </div>
      )}
      <div
        id={title.replace(/\s/g, '-') + '-section'}
        className={collapsed ? 'hidden' : 'block p-6'}
      >
        {children}
      </div>
    </div>
  )
}
