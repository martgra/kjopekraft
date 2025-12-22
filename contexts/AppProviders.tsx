'use client'

import { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { DisplayModeProvider } from '@/contexts/displayMode/DisplayModeContext'
import { ReferenceModeProvider } from '@/contexts/referenceMode/ReferenceModeContext'
import { ThemeProvider } from '@/contexts/theme/ThemeContext'
import { PurchasingPowerBaseProvider } from '@/contexts/purchasingPower/PurchasingPowerBaseContext'
import { LoginOverlayProvider } from '@/contexts/loginOverlay/LoginOverlayContext'
import { ToastProvider } from '@/contexts/toast/ToastContext'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * Compound provider that wraps all application-level context providers.
 * This reduces provider nesting in the root layout and centralizes
 * the provider hierarchy for better maintainability.
 *
 * Includes:
 * - ThemeProvider: Dark/light mode theme toggle (localStorage)
 * - NuqsAdapter: enables URL-based state via nuqs (shareable, hydration-safe)
 * - DisplayModeProvider: Net/gross salary display toggle (nuqs)
 * - ReferenceModeProvider: Reference salary overlay toggle (nuqs)
 *
 * Note: DrawerProvider is not included here as it requires pathname
 * and is handled separately in ClientLayoutWrapper.
 *
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <NuqsAdapter>
        <DisplayModeProvider>
          <ReferenceModeProvider>
            <PurchasingPowerBaseProvider>
              <LoginOverlayProvider>
                <ToastProvider>{children}</ToastProvider>
              </LoginOverlayProvider>
            </PurchasingPowerBaseProvider>
          </ReferenceModeProvider>
        </DisplayModeProvider>
      </NuqsAdapter>
    </ThemeProvider>
  )
}
