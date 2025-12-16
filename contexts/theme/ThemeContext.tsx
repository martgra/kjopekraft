'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * Theme provider for dark mode
 * Persists theme preference in localStorage and syncs with system preference
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = storedTheme || systemTheme

    setThemeState(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    setMounted(true)
  }, [])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light'
        setThemeState(newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const contextValue = useMemo(() => {
    const isDarkMode = theme === 'dark'

    const setTheme = (newTheme: Theme) => {
      setThemeState(newTheme)
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }

    const toggleTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light')
    }

    return { theme, isDarkMode, toggleTheme, setTheme }
  }, [theme])

  // Prevent flash of unstyled content
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
