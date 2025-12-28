'use client'

import { useEffect } from 'react'
import { TEXT } from '@/lib/constants/text'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-[var(--text-main)]">{TEXT.common.error}</h1>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-medium text-white shadow-sm"
      >
        {TEXT.common.reset}
      </button>
    </main>
  )
}
