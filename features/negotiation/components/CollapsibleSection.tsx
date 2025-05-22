import React, { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultCollapsed?: boolean
  collapseLabel: string
}

export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  collapseLabel,
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  return (
    <div className="mt-6 rounded border bg-gray-50">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 text-left font-semibold hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
        aria-controls={title.replace(/\s/g, '-') + '-section'}
      >
        <span>{title}</span>
        <span className="ml-2">
          {collapseLabel} {collapsed ? '▼' : '▲'}
        </span>
      </button>
      <div id={title.replace(/\s/g, '-') + '-section'} className={collapsed ? 'hidden' : 'block'}>
        {children}
      </div>
    </div>
  )
}
