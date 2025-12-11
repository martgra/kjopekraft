import React, { useState, useEffect } from 'react'
import { TEXT } from '@/lib/constants/text'

interface NegotiationUserInfo {
  jobTitle: string
  industry: string
  isNewJob: boolean | null
  currentSalary: string
  desiredSalary: string
  marketData: string
  otherBenefits: string
}

interface Props {
  initialData?: Partial<NegotiationUserInfo>
  onChange: (data: NegotiationUserInfo) => void
}

const inputBaseClasses =
  'w-full rounded-lg border border-[var(--border-light)] bg-white text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] text-sm py-2.5 px-3 transition-colors'

const labelClasses = 'block text-sm font-medium text-[var(--text-main)] mb-1.5'

const NegotiationUserInfoForm: React.FC<Props> = ({ initialData = {}, onChange }) => {
  const [form, setForm] = useState<NegotiationUserInfo>({
    jobTitle: initialData.jobTitle || '',
    industry: initialData.industry || '',
    isNewJob: initialData.isNewJob ?? null,
    currentSalary: initialData.currentSalary || '',
    desiredSalary: initialData.desiredSalary || '',
    marketData: initialData.marketData || '',
    otherBenefits: initialData.otherBenefits || '',
  })

  // Sync with initialData when it changes (e.g., when derived salary loads)
  useEffect(() => {
    if (initialData.currentSalary && initialData.currentSalary !== form.currentSalary) {
      setForm(prev => ({ ...prev, currentSalary: initialData.currentSalary || prev.currentSalary }))
    }
  }, [initialData.currentSalary, form.currentSalary])

  function handleChange<K extends keyof NegotiationUserInfo>(
    key: K,
    value: NegotiationUserInfo[K],
  ) {
    const updated = { ...form, [key]: value }
    setForm(updated)
    onChange(updated)
  }

  return (
    <div className="rounded-xl border border-[var(--border-light)] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClasses}>{TEXT.negotiationForm.jobTitleLabel}</label>
          <input
            type="text"
            className={inputBaseClasses}
            value={form.jobTitle}
            placeholder={TEXT.negotiationForm.jobTitlePlaceholder}
            onChange={e => handleChange('jobTitle', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClasses}>{TEXT.negotiationForm.industryLabel}</label>
          <input
            type="text"
            className={inputBaseClasses}
            value={form.industry}
            placeholder={TEXT.negotiationForm.industryPlaceholder}
            onChange={e => handleChange('industry', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClasses}>{TEXT.negotiationForm.isNewJobLabel}</label>
          <select
            className={inputBaseClasses}
            value={form.isNewJob === null ? '' : form.isNewJob ? 'yes' : 'no'}
            onChange={e =>
              handleChange(
                'isNewJob',
                e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null,
              )
            }
          >
            <option value="">{TEXT.negotiationForm.selectPlaceholder}</option>
            <option value="yes">{TEXT.negotiationForm.yesOption}</option>
            <option value="no">{TEXT.negotiationForm.noOption}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClasses}>{TEXT.negotiationForm.currentSalaryLabel}</label>
          <input
            type="text"
            className={inputBaseClasses}
            value={form.currentSalary}
            placeholder={TEXT.negotiationForm.currentSalaryPlaceholder}
            onChange={e => handleChange('currentSalary', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5 md:col-span-1">
          <label className={labelClasses}>{TEXT.negotiationForm.desiredSalaryLabel}</label>
          <input
            type="text"
            className={inputBaseClasses}
            value={form.desiredSalary}
            placeholder={TEXT.negotiationForm.desiredSalaryPlaceholder}
            onChange={e => handleChange('desiredSalary', e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className={labelClasses}>{TEXT.negotiationForm.marketDataLabel}</label>
          <textarea
            className={`${inputBaseClasses} resize-none`}
            value={form.marketData}
            placeholder={TEXT.negotiationForm.marketDataPlaceholder}
            onChange={e => handleChange('marketData', e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClasses}>{TEXT.negotiationForm.otherBenefitsLabel}</label>
          <textarea
            className={`${inputBaseClasses} resize-none`}
            value={form.otherBenefits}
            placeholder={TEXT.negotiationForm.otherBenefitsPlaceholder}
            onChange={e => handleChange('otherBenefits', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--text-muted)] italic">
        {TEXT.negotiationForm.achievementsNote}
      </p>
    </div>
  )
}

export default NegotiationUserInfoForm
