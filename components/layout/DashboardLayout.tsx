'use client'

import Sidebar from './Sidebar'
import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  rightPanel?: ReactNode
}

export default function DashboardLayout({ children, rightPanel }: DashboardLayoutProps) {
  return (
    <div className="app-shell flex flex-col overflow-hidden bg-[var(--background-light)] lg:flex-row">
      {/* Left Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:h-full">
        <Sidebar />
      </div>

      {/* Main Content - Scrollable with mobile padding for header and nav */}
      <div className="flex-1 overflow-y-auto px-4 pt-[calc(4.5rem+env(safe-area-inset-top))] pb-[calc(var(--mobile-bottom-nav-height,4.5rem)+env(safe-area-inset-bottom))] lg:p-10 lg:pt-10 lg:pb-10">
        {children}
      </div>

      {/* Right Panel - Hidden on mobile (uses drawer instead), sidebar on desktop */}
      {rightPanel && (
        <aside className="hidden w-full shrink-0 border-t border-[var(--border-light)] bg-[var(--surface-light)] pb-20 lg:block lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l lg:pb-0">
          {rightPanel}
        </aside>
      )}
    </div>
  )
}
