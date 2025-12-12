'use client'

import dynamic from 'next/dynamic'

// Dynamically import the wrapper with SSR disabled
// This prevents hydration issues with localStorage-dependent components
const NegotiationPageWrapper = dynamic(
  () => import('@/features/negotiation/components/NegotiationPageWrapper'),
  { ssr: false },
)

export default function Page() {
  return <NegotiationPageWrapper />
}
