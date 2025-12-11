'use client'

import Sidebar from './Sidebar'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  rightPanel?: ReactNode
}

export default function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background-light)]">
      {/* Left Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Center Content - Always visible, scrollable */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</div>

          {/* Right Sidebar - Hidden on mobile, shown on desktop */}
          {rightPanel && (
            <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-[var(--border-light)] bg-[var(--surface-light)] lg:flex lg:flex-col">
              {rightPanel}
            </aside>
          )}
        </div>
      </main>

      {/* Mobile: Right Panel Stacked Below on Mobile */}
      {rightPanel && (
        <div className="w-full border-t border-[var(--border-light)] bg-[var(--surface-light)] lg:hidden">
          {rightPanel}
        </div>
      )}
    </div>
  )
}
