'use client'

import useSWR from 'swr'
import { authClient } from '@/lib/auth-client'
import { TEXT } from '@/lib/constants/text'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'
import { UserMenu } from '@/components/layout/UserMenu'

export default function MobileHeader() {
  const { data: session, isPending } = authClient.useSession()
  const { open: openLoginOverlay } = useLoginOverlay()
  const shouldFetchCredits = Boolean(session?.user)
  const { data: creditsData } = useSWR<{ credits: { remaining: number; limit: number } }>(
    shouldFetchCredits ? '/api/credits' : null,
    async url => {
      const res = await fetch(url)
      return (await res.json()) as { credits: { remaining: number; limit: number } }
    },
    { revalidateOnFocus: false, refreshInterval: 15000 },
  )
  const creditsLabel = creditsData
    ? `${creditsData.credits.remaining}/${creditsData.credits.limit}`
    : '—'

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--border-light)] bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden dark:border-gray-800 dark:bg-gray-900/90">
        <div className="flex items-center justify-between px-5 py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
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
          </div>

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
