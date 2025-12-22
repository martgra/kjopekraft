'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import MobileBottomNav from './MobileBottomNav'
import MobileHeader from './MobileHeader'
import { DrawerProvider, useDrawer } from '@/contexts/drawer/DrawerContext'
import GlobalHeader from '@/components/layout/GlobalHeader'

interface ClientLayoutWrapperProps {
  children: ReactNode
}

function ClientLayoutWrapperInner({ children }: ClientLayoutWrapperProps) {
  const { toggleDrawer, pointsCount } = useDrawer()

  return (
    <>
      <GlobalHeader />
      <MobileHeader />
      {children}
      <MobileBottomNav onOpenDrawer={toggleDrawer} pointsCount={pointsCount} />
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
