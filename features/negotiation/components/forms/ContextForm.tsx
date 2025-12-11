'use client'

import { Card, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import type { UserInfo } from './DetailsForm'

export interface ContextFormProps {
  userInfo: UserInfo
  onChange: (updates: Partial<UserInfo>) => void
}

const inputClasses =
  'w-full rounded-md border border-[var(--border-light)] bg-gray-50 text-[var(--text-main)] text-sm py-1.5 px-3 focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors'

export function ContextForm({ userInfo, onChange }: ContextFormProps) {
  return (
    <Card
      variant="default"
      padding="md"
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
        <Icon name="query_stats" size="md" className="text-purple-500" />
        {TEXT.negotiationForm.contextTitle}
      </h2>

      <div className="flex h-full flex-col gap-4 overflow-hidden md:flex-row">
        {/* Market Data */}
        <div className="flex h-full w-full flex-col space-y-1 md:w-1/2">
          <label className="block text-xs font-medium text-[var(--text-muted)]">
            {TEXT.negotiationForm.marketDataLabel}
          </label>
          <textarea
            className={`${inputClasses} flex-1 resize-none p-3`}
            placeholder={TEXT.negotiationForm.marketDataPlaceholder}
            value={userInfo.marketData}
            onChange={(e) => onChange({ marketData: e.target.value })}
          />
        </div>

        {/* Other Benefits */}
        <div className="flex h-full w-full flex-col space-y-1 md:w-1/2">
          <label className="block text-xs font-medium text-[var(--text-muted)]">
            {TEXT.negotiationForm.otherBenefitsLabel}
          </label>
          <textarea
            className={`${inputClasses} flex-1 resize-none p-3`}
            placeholder={TEXT.negotiationForm.otherBenefitsPlaceholder}
            value={userInfo.otherBenefits}
            onChange={(e) => onChange({ otherBenefits: e.target.value })}
          />
        </div>
      </div>
    </Card>
  )
}
