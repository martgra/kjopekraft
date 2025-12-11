import Link from 'next/link'
import NegotiationTab from '@/features/negotiation/components/NegotiationTab.client'

export default function NegotiationPage() {
  return (
    <div className="min-h-screen bg-[var(--background-light)] p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)] md:text-4xl">
            Salary Negotiation Assistant
          </h1>
          <p className="mt-2 text-base text-[var(--text-muted)]">
            Generate personalized negotiation strategies and emails powered by AI.
          </p>
        </div>

        <NegotiationTab />
      </div>
    </div>
  )
}
