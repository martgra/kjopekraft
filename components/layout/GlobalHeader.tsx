'use client'

import useSWR from 'swr'
import { authClient } from '@/lib/auth-client'
import { TEXT } from '@/lib/constants/text'
import { Badge } from '@/components/ui/atoms'
import { useLoginOverlay } from '@/contexts/loginOverlay/LoginOverlayContext'

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
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)]">
            <span className="text-lg" role="img" aria-label="Money with wings">
              💸
            </span>
          </div>
          <span className="text-base font-bold text-[var(--text-main)] dark:text-gray-100">
            {TEXT.sidebar.brandName}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {session?.user && (
            <Badge variant="info" className="gap-1">
              <span>{TEXT.credits.headerLabel}</span>
              <span className="font-semibold text-[var(--text-main)]">{creditsLabel}</span>
            </Badge>
          )}

          {isPending ? (
            <div className="h-9 w-28 animate-pulse rounded-full border border-[var(--border-light)] bg-white/80 shadow-sm dark:border-gray-700/70 dark:bg-gray-900/70" />
          ) : session?.user ? (
            <button
              type="button"
              onClick={() => authClient.signOut()}
              className="rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-semibold tracking-wide text-white uppercase hover:bg-[var(--primary)]/90"
            >
              {TEXT.auth.signOut}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openLoginOverlay()}
              className="rounded-full border border-[var(--border-light)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--text-main)] shadow-sm backdrop-blur hover:border-[var(--primary)]/40 dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-gray-100"
            >
              {TEXT.auth.signIn}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
