'use client'

import { useState, createContext, useContext, ReactNode } from 'react'

interface DrawerContextType {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  pointsCount: number
  setDashboardPointsCount: (count: number) => void
  setNegotiationPointsCount: (count: number) => void
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider')
  }
  return context
}

interface DrawerProviderProps {
  children: ReactNode
  pathname: string
}

export function DrawerProvider({ children, pathname }: DrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dashboardPointsCount, setDashboardPointsCount] = useState(0)
  const [negotiationPointsCount, setNegotiationPointsCount] = useState(0)

  const openDrawer = () => setIsOpen(true)
  const closeDrawer = () => setIsOpen(false)
  const toggleDrawer = () => setIsOpen(prev => !prev)

  // Return the appropriate points count based on the current route
  const isDashboard = pathname === '/'
  const isNegotiation = pathname === '/negotiation'
  const pointsCount = isDashboard
    ? dashboardPointsCount
    : isNegotiation
      ? negotiationPointsCount
      : 0

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        pointsCount,
        setDashboardPointsCount,
        setNegotiationPointsCount,
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}
