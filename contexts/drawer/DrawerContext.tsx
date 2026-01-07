'use client'

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { STORAGE_KEYS } from '@/lib/constants/storage'

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

  useEffect(() => {
    if (!isNegotiation) return
    try {
      window.localStorage.setItem(STORAGE_KEYS.negotiationDrawerState, String(isOpen))
    } catch (error) {
      console.warn('Failed to persist negotiation drawer state', error)
    }
  }, [isNegotiation, isOpen])

  useEffect(() => {
    if (!isNegotiation) return
    try {
      const restore = window.localStorage.getItem(STORAGE_KEYS.negotiationDrawerRestore)
      if (restore !== 'true') return
      window.localStorage.removeItem(STORAGE_KEYS.negotiationDrawerRestore)
      setIsOpen(true)
    } catch (error) {
      console.warn('Failed to restore negotiation drawer state', error)
    }
  }, [isNegotiation])

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
