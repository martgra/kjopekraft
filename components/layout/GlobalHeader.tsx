'use client'

import { authClient } from '@/lib/auth-client'
import { TEXT } from '@/lib/constants/text'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'
import { UserMenu } from '@/components/layout/UserMenu'
import { useCredits } from '@/features/credits/hooks/useCredits'
import { Cluster } from '@/components/ui/layout'

export default function GlobalHeader() {
  const { data: session, isPending } = authClient.useSession()
  const { open: openLoginOverlay } = useLoginOverlay()
  const { label: creditsLabel } = useCredits({ enabled: Boolean(session?.user) })

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[var(--border-light)] bg-[var(--surface-light)]/90 backdrop-blur lg:block">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Cluster gap="md" align="center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-md">
            <span className="material-symbols-outlined text-xl text-white">
              account_balance_wallet
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[var(--text-main)] dark:text-gray-100">
              {TEXT.sidebar.brandName}
            </span>
            {session?.user ? (
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-blue-600 uppercase dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <span className="material-symbols-outlined text-[10px]">bolt</span>
                <span>{TEXT.credits.headerLabel}</span>
                <span className="text-blue-800 dark:text-blue-200">{creditsLabel}</span>
              </div>
            ) : null}
          </div>
        </Cluster>

        <div className="flex items-center gap-3">
          <UserMenu
            session={session}
            isPending={isPending}
            onSignOut={() => authClient.signOut()}
            onOpenLogin={openLoginOverlay}
          />
        </div>
      </div>
    </header>
  )
}
