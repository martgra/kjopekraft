'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import MobileBottomNav from './MobileBottomNav'
import MobileHeader from './MobileHeader'
import { DrawerProvider, useDrawer } from '@/contexts/drawer/DrawerContext'
import GlobalHeader from '@/components/layout/GlobalHeader'

// Design pages render their own top bar/navigation (matching the design system),
// so we skip the global chrome on them.
const DESIGN_PAGES = new Set(['/', '/negotiation'])

interface ClientLayoutWrapperProps {
  children: ReactNode
}

function ClientLayoutWrapperInner({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname()
  const { toggleDrawer, pointsCount, isOpen } = useDrawer()

  if (DESIGN_PAGES.has(pathname)) {
    return <>{children}</>
  }

  return (
    <>
      <GlobalHeader />
      <MobileHeader />
      {children}
      <MobileBottomNav
        onOpenDrawer={toggleDrawer}
        pointsCount={pointsCount}
        isDrawerOpen={isOpen}
      />
    </>
  )
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname()

  return (
    <DrawerProvider pathname={pathname}>
      <ClientLayoutWrapperInner>{children}</ClientLayoutWrapperInner>
    </DrawerProvider>
  )
}
