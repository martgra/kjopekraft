'use client'

import { ReactNode } from 'react'
import MobileBottomNav from './MobileBottomNav'
import { useDrawer } from '@/contexts/drawer/DrawerContext'

interface ClientLayoutWrapperProps {
  children: ReactNode
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const { toggleDrawer, pointsCount } = useDrawer()

  return (
    <>
      {children}
      <MobileBottomNav onOpenDrawer={toggleDrawer} pointsCount={pointsCount} />
    </>
  )
}
