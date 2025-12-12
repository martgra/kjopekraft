'use client'

import { Card, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'

export interface UserInfo {
  jobTitle: string
  industry: string
  isNewJob: boolean
  currentSalary: string
  desiredSalary: string
  marketData: string
  otherBenefits: string
}

export interface DetailsFormProps {
  userInfo: UserInfo
  onChange: (updates: Partial<UserInfo>) => void
}

const inputClasses =
  'w-full rounded-md border border-[var(--border-light)] bg-gray-50 text-[var(--text-main)] text-base py-1.5 px-3 focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] transition-colors'

export function DetailsForm({ userInfo, onChange }: DetailsFormProps) {
  return (
    <Card variant="default" padding="md" className="flex-shrink-0">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
        <Icon name="person_search" size="md" className="text-[var(--primary)]" />
        {TEXT.negotiationForm.detailsTitle}
      </h2>

      <div className="grid grid-cols-12 gap-3 md:gap-4">
        {/* Job Title */}
        <div className="col-span-12 space-y-1 md:col-span-5">
          <label className="block text-xs font-medium text-[var(--text-muted)]">
            {TEXT.negotiationForm.jobTitleLabel}
          </label>
          <input
            type="text"
            className={inputClasses}
            placeholder={TEXT.negotiationForm.jobTitlePlaceholder}
            value={userInfo.jobTitle}
            onChange={e => onChange({ jobTitle: e.target.value })}
          />
        </div>

        {/* Industry */}
        <div className="col-span-12 space-y-1 md:col-span-4">
          <label className="block text-xs font-medium text-[var(--text-muted)]">
            {TEXT.negotiationForm.industryLabel}
          </label>
          <input
            type="text"
            className={inputClasses}
            placeholder={TEXT.negotiationForm.industryPlaceholder}
            value={userInfo.industry}
            onChange={e => onChange({ industry: e.target.value })}
          />
        </div>

        {/* Is New Job */}
        <div className="col-span-12 space-y-1 md:col-span-3">
          <label className="block text-xs font-medium text-[var(--text-muted)]">
            {TEXT.negotiationForm.isNewJobLabel}
          </label>
          <select
            className={inputClasses}
            value={userInfo.isNewJob ? 'yes' : 'no'}
            onChange={e => onChange({ isNewJob: e.target.value === 'yes' })}
          >
            <option value="no">{TEXT.negotiationForm.noOption}</option>
            <option value="yes">{TEXT.negotiationForm.yesOption}</option>
          </select>
        </div>

        {/* Current Salary */}
        <div className="col-span-6 space-y-1">
          <label className="block text-xs font-medium text-[var(--text-muted)]">
            {TEXT.negotiationForm.currentSalaryLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              className={`${inputClasses} pr-12 font-mono`}
              placeholder="650 000"
              value={userInfo.currentSalary}
              onChange={e => onChange({ currentSalary: e.target.value })}
            />
            <span className="absolute top-1.5 right-3 text-xs text-gray-400">NOK</span>
          </div>
        </div>

        {/* Desired Salary */}
        <div className="col-span-6 space-y-1">
          <label className="block text-xs font-medium text-[var(--primary)]">
            {TEXT.negotiationForm.desiredSalaryLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              className={`${inputClasses} border-[var(--primary)]/50 bg-white pr-12 font-mono font-bold`}
              placeholder="700 000"
              value={userInfo.desiredSalary}
              onChange={e => onChange({ desiredSalary: e.target.value })}
            />
            <span className="absolute top-1.5 right-3 text-xs text-gray-400">NOK</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
