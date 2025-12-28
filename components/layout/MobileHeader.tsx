'use client'

import { authClient } from '@/lib/auth-client'
import { TEXT } from '@/lib/constants/text'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'
import { UserMenu } from '@/components/layout/UserMenu'
import { useCredits } from '@/features/credits/hooks/useCredits'
import { Cluster } from '@/components/ui/layout'

export default function MobileHeader() {
  const { data: session, isPending } = authClient.useSession()
  const { open: openLoginOverlay } = useLoginOverlay()
  const hasSession = Boolean(session?.user)
  const { label: creditsLabel } = useCredits({ enabled: hasSession })

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--border-light)]/70 bg-[var(--background-light)]/95 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden dark:bg-[var(--background)]/90">
        <div className="flex items-center justify-between px-5 py-2">
          {/* Brand */}
          <Cluster gap="md" align="center">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500 shadow-lg shadow-cyan-500/25">
              <span className="material-symbols-outlined text-lg text-white">
                account_balance_wallet
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold tracking-tight text-[var(--text-main)] dark:text-gray-100">
                {TEXT.sidebar.brandName}
              </span>
              {hasSession ? (
                <div className="mt-0.5 inline-flex items-center gap-1.5 rounded-md border border-indigo-500/20 bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-indigo-600 uppercase dark:border-indigo-400/30 dark:bg-indigo-950/60 dark:text-indigo-200">
                  <span className="material-symbols-outlined text-[9px]">bolt</span>
                  <span>{TEXT.credits.headerLabel}</span>
                  <span className="text-indigo-800 dark:text-indigo-100">{creditsLabel}</span>
                </div>
              ) : null}
            </div>
          </Cluster>

          <UserMenu
            session={session}
            isPending={isPending}
            onSignOut={() => authClient.signOut()}
            onOpenLogin={openLoginOverlay}
          />
        </div>
      </header>
    </>
  )
}
