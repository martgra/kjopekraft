'use client'

import { useState, createContext, useContext, ReactNode } from 'react'

interface DrawerContextType {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  pointsCount: number
  setPointsCount: (count: number) => void
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
}

export function DrawerProvider({ children }: DrawerProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pointsCount, setPointsCount] = useState(0)

  const openDrawer = () => setIsOpen(true)
  const closeDrawer = () => setIsOpen(false)
  const toggleDrawer = () => setIsOpen(prev => !prev)

  return (
    <DrawerContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        pointsCount,
        setPointsCount,
      }}
    >
      {children}
    </DrawerContext.Provider>
  )
}
