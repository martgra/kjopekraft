'use client'

import { Card, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import type { NegotiationUserInfo } from '@/lib/schemas/negotiation'

export interface ContextFormProps {
  userInfo: NegotiationUserInfo
  onChange: (updates: Partial<NegotiationUserInfo>) => void
  showMarketData?: boolean
}

const inputClasses =
  'w-full rounded-md border border-[var(--border-light)] bg-[var(--surface-subtle)] text-[var(--text-main)] text-base py-1.5 px-3 focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors'

export function ContextForm({ userInfo, onChange, showMarketData = true }: ContextFormProps) {
  return (
    <Card variant="default" padding="md" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
        <Icon name="query_stats" size="md" className="text-purple-500" />
        {TEXT.negotiationForm.contextTitle}
      </h2>

      {showMarketData ? (
        <div className="flex h-full flex-col gap-4 overflow-hidden">
          <div className="flex h-full w-full flex-col space-y-1">
            <label className="block text-xs font-medium text-[var(--text-muted)]">
              {TEXT.negotiationForm.marketDataLabel}
            </label>
            <textarea
              className={`${inputClasses} flex-1 resize-none p-3`}
              placeholder={TEXT.negotiationForm.marketDataPlaceholder}
              value={userInfo.marketData}
              onChange={e => onChange({ marketData: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)]">{TEXT.negotiationForm.marketDataHint}</p>
      )}
    </Card>
  )
}
