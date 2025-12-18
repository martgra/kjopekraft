'use client'

import { Card, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { NEGOTIATION_BENEFIT_OPTIONS } from '@/lib/negotiation/benefitOptions'
import type { UserInfo } from './DetailsForm'

export interface BenefitsFormProps {
  userInfo: UserInfo
  onChange: (updates: Partial<UserInfo>) => void
}

const inputClasses =
  'w-full rounded-md border border-[var(--border-light)] bg-[var(--surface-subtle)] text-[var(--text-main)] text-base py-1.5 px-3 focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors'

export function BenefitsForm({ userInfo, onChange }: BenefitsFormProps) {
  const selected = userInfo.benefits ?? []

  const toggleBenefit = (id: string) => {
    const isSelected = selected.includes(id)
    const next = isSelected ? selected.filter(item => item !== id) : [...selected, id]
    onChange({ benefits: next })
  }

  return (
    <Card variant="default" padding="md" className="flex flex-col gap-4">
      <div>
        <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
          <Icon name="redeem" size="md" className="text-[var(--primary)]" />
          {TEXT.negotiationBenefits.title}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">{TEXT.negotiationBenefits.description}</p>
      </div>

      <details className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2 text-[var(--text-main)]">
        <summary className="cursor-pointer list-none text-sm font-medium text-[var(--text-main)]">
          <span className="flex items-center justify-between">
            {TEXT.negotiationBenefits.toggleLabel}
            <Icon name="expand_more" className="text-lg text-[var(--text-muted)]" />
          </span>
        </summary>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {NEGOTIATION_BENEFIT_OPTIONS.map(option => {
            const isSelected = selected.includes(option.id)
            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-[var(--surface-subtle)] px-2 py-2 text-sm text-[var(--text-main)] transition-colors hover:border-[var(--border-light)]"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--primary)]"
                  checked={isSelected}
                  onChange={() => toggleBenefit(option.id)}
                />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
      </details>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-[var(--text-muted)]">
          {TEXT.negotiationBenefits.notesLabel}
        </label>
        <textarea
          className={`${inputClasses} min-h-[120px] resize-none p-3`}
          placeholder={TEXT.negotiationBenefits.notesPlaceholder}
          value={userInfo.otherBenefits}
          onChange={e => onChange({ otherBenefits: e.target.value })}
        />
      </div>
    </Card>
  )
}
