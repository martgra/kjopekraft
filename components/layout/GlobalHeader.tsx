'use client'

import useSWR from 'swr'
import { authClient } from '@/lib/auth-client'
import { TEXT } from '@/lib/constants/text'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'
import { UserMenu } from '@/components/layout/UserMenu'

type CreditsResponse = {
  credits: {
    used: number
    limit: number
    remaining: number
  }
}

export default function GlobalHeader() {
  const { data: session, isPending } = authClient.useSession()
  const { open: openLoginOverlay } = useLoginOverlay()
  const shouldFetchCredits = Boolean(session?.user)
  const { data: creditsData } = useSWR<CreditsResponse>(
    shouldFetchCredits ? '/api/credits' : null,
    async url => {
      const res = await fetch(url)
      return (await res.json()) as CreditsResponse
    },
    { revalidateOnFocus: false, refreshInterval: 15000 },
  )

  const creditsLabel = creditsData
    ? `${creditsData.credits.remaining}/${creditsData.credits.limit}`
    : '—'

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[var(--border-light)] bg-white/90 backdrop-blur lg:block dark:border-gray-800 dark:bg-gray-900/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
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
