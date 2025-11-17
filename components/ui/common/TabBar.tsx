'use client'

import React, { ReactNode } from 'react'

interface TabBarProps {
  tabs: { key: string; label: ReactNode }[]
  active: string
  onChange: (key: string) => void
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <nav className="mb-6">
      <div className="border-b border-neutral-200">
        <ul className="-mb-px flex space-x-1">
          {tabs.map(tab => (
            <li key={tab.key}>
              <button
                onClick={() => onChange(tab.key)}
                className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  active === tab.key
                    ? 'border-primary-600 text-primary-600 border-b-2 bg-white'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                } `}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
