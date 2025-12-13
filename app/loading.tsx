import { Spinner } from '@/components/ui/atoms'

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--background-light)]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-[var(--text-muted)]">Laster...</p>
      </div>
    </div>
  )
}
