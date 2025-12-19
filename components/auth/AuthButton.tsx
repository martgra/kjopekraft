'use client'

import { useEffect, useMemo, useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { TEXT } from '@/lib/constants/text'

export default function AuthButton() {
  const { data: session, isPending } = authClient.useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [timezoneSent, setTimezoneSent] = useState(false)

  const displayName = useMemo(() => session?.user?.name ?? session?.user?.email ?? '', [session])

  useEffect(() => {
    if (!session?.user?.id || timezoneSent) return
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!timezone) return

    fetch('/api/user/timezone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone }),
    })
      .catch(() => null)
      .finally(() => setTimezoneSent(true))
  }, [session?.user?.id, timezoneSent])

  if (isPending) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="h-9 w-28 animate-pulse rounded-full border border-[var(--border-light)] bg-white/80 shadow-sm dark:border-gray-700/70 dark:bg-gray-900/70" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-white/90 px-3 py-1.5 text-sm text-[var(--text-main)] shadow-sm backdrop-blur dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-gray-100">
        {displayName ? <span className="max-w-[160px] truncate">{displayName}</span> : null}
        <button
          type="button"
          onClick={() => authClient.signOut()}
          className="rounded-full bg-[var(--primary)] px-3 py-1 text-[11px] font-semibold tracking-wide text-white uppercase hover:bg-[var(--primary)]/90"
        >
          {TEXT.auth.signOut}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="rounded-full border border-[var(--border-light)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--text-main)] shadow-sm backdrop-blur hover:border-[var(--primary)]/40 dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-gray-100"
      >
        {TEXT.auth.signIn}
      </button>
      {isOpen ? (
        <div className="flex w-44 flex-col gap-2 rounded-2xl border border-[var(--border-light)] bg-white/95 p-3 text-sm shadow-lg backdrop-blur dark:border-gray-700/70 dark:bg-gray-900/90">
          <button
            type="button"
            onClick={() => authClient.signIn.social({ provider: 'google' })}
            className="rounded-lg bg-[var(--primary)] px-3 py-2 text-left text-xs font-semibold text-white hover:bg-[var(--primary)]/90"
          >
            {TEXT.auth.signInWithGoogle}
          </button>
          <button
            type="button"
            onClick={() => authClient.signIn.social({ provider: 'github' })}
            className="rounded-lg border border-[var(--border-light)] px-3 py-2 text-left text-xs font-semibold text-[var(--text-main)] hover:border-[var(--primary)]/40 dark:border-gray-700/70 dark:text-gray-100"
          >
            {TEXT.auth.signInWithGithub}
          </button>
        </div>
      ) : null}
    </div>
  )
}
