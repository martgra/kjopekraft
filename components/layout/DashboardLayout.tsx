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
      <div className="hidden lg:flex lg:h-full">
        <Sidebar />
      </div>

      {/* Main Content - Scrollable with mobile bottom padding for nav */}
      <div className="flex-1 overflow-y-auto p-6 pb-20 lg:p-10 lg:pb-10">{children}</div>

      {/* Right Panel - Stacked on mobile, sidebar on desktop */}
      {rightPanel && (
        <aside className="w-full shrink-0 border-t border-[var(--border-light)] bg-[var(--surface-light)] pb-20 lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:pb-0">
          {rightPanel}
        </aside>
      )}
    </div>
  )
}
