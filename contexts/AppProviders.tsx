'use client'

import { ReactNode } from 'react'
import { DisplayModeProvider } from '@/contexts/displayMode/DisplayModeContext'
import { ReferenceModeProvider } from '@/contexts/referenceMode/ReferenceModeContext'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * Compound provider that wraps all application-level context providers.
 * This reduces provider nesting in the root layout and centralizes
 * the provider hierarchy for better maintainability.
 *
 * Includes:
 * - DisplayModeProvider: Net/gross salary display toggle (localStorage)
 * - ReferenceModeProvider: Reference salary overlay toggle (localStorage)
 *
 * Note: DrawerProvider is not included here as it requires pathname
 * and is handled separately in ClientLayoutWrapper.
 *
 * Note: nuqs is installed for future URL-based state migration.
 * See lib/searchParams.ts for prepared configuration.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <DisplayModeProvider>
      <ReferenceModeProvider>{children}</ReferenceModeProvider>
    </DisplayModeProvider>
  )
}
