'use client'

import React, { ReactNode } from 'react'

interface TabBarProps {
  tabs: { key: string; label: ReactNode }[]
  active: string
  onChange: (key: string) => void
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <nav className="mb-6 border-b border-gray-200">
      <ul className="-mb-px flex space-x-6">
        {tabs.map(tab => (
          <li key={tab.key}>
            <button
              onClick={() => onChange(tab.key)}
              className={
                active === tab.key
                  ? 'border-b-2 border-indigo-600 pb-2 text-indigo-600'
                  : 'pb-2 text-gray-500 hover:text-gray-700'
              }
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
