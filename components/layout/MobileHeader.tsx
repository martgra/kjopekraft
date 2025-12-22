'use client'

import useSWR from 'swr'
import { authClient } from '@/lib/auth-client'
import { TEXT } from '@/lib/constants/text'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'
import { Badge } from '@/components/ui/atoms'

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
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--border-light)] bg-white pt-[env(safe-area-inset-top)] shadow-sm lg:hidden dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
              <span className="text-lg" role="img" aria-label="Money with wings">
                💸
              </span>
            </div>
            <span className="text-base font-bold text-[var(--text-main)] dark:text-gray-100">
              {TEXT.sidebar.brandName}
            </span>
          </div>

          {/* Auth Button */}
          {isPending ? (
            <div className="h-8 w-20 animate-pulse rounded-full border border-[var(--border-light)] bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <Badge variant="info" className="gap-1 px-2 py-0.5 text-[10px]">
                <span>{TEXT.credits.headerLabel}</span>
                <span className="font-semibold text-[var(--text-main)]">{creditsLabel}</span>
              </Badge>
              <button
                type="button"
                onClick={() => authClient.signOut()}
                className="rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase hover:bg-[var(--primary)]/90"
              >
                {TEXT.auth.signOut}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openLoginOverlay()}
              className="rounded-full border border-[var(--border-light)] bg-white px-4 py-1.5 text-sm font-semibold text-[var(--text-main)] hover:border-[var(--primary)]/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {TEXT.auth.signIn}
            </button>
          )}
        </div>
      </header>
    </>
  )
}
