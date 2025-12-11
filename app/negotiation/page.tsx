import { Suspense } from 'react'
import NegotiationPage from '@/features/negotiation/components/NegotiationPage'
import { Spinner } from '@/components/ui/atoms'

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--background-light)]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-[var(--text-muted)]">Laster...</p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NegotiationPage />
    </Suspense>
  )
}
