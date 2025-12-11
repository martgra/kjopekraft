'use client'

import Sidebar from './Sidebar'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  rightPanel?: ReactNode
}

export default function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--background-light)] lg:flex-row">
      {/* Left Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</div>

      {/* Right Panel - Stacked on mobile, sidebar on desktop */}
      {rightPanel && (
        <aside className="w-full shrink-0 border-t border-[var(--border-light)] bg-[var(--surface-light)] lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l">
          {rightPanel}
        </aside>
      )}
    </div>
  )
}
