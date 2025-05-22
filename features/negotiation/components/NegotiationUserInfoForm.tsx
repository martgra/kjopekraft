import React, { useState } from 'react'

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

  function handleChange<K extends keyof NegotiationUserInfo>(
    key: K,
    value: NegotiationUserInfo[K],
  ) {
    const updated = { ...form, [key]: value }
    setForm(updated)
    onChange(updated)
  }

  return (
    <form className="mx-auto max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Stillingstittel</label>
          <input
            type="text"
            className="w-full rounded border px-2 py-1 transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            value={form.jobTitle}
            placeholder="F.eks. Utvikler, Prosjektleder"
            onChange={e => handleChange('jobTitle', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bransje</label>
          <input
            type="text"
            className="w-full rounded border px-2 py-1 transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            value={form.industry}
            placeholder="F.eks. IT, Helse, Bygg"
            onChange={e => handleChange('industry', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Er dette en ny jobb?
          </label>
          <select
            className="w-full rounded border px-2 py-1 transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            value={form.isNewJob === null ? '' : form.isNewJob ? 'yes' : 'no'}
            onChange={e =>
              handleChange(
                'isNewJob',
                e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null,
              )
            }
          >
            <option value="">Velg</option>
            <option value="yes">Ja</option>
            <option value="no">Nei</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nåværende lønnsnivå
          </label>
          <input
            type="text"
            className="w-full rounded border px-2 py-1 transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            value={form.currentSalary}
            placeholder="F.eks. 650 000 kr"
            onChange={e => handleChange('currentSalary', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Ønsket lønnsnivå</label>
          <input
            type="text"
            className="w-full rounded border px-2 py-1 transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            value={form.desiredSalary}
            placeholder="F.eks. 700 000 kr"
            onChange={e => handleChange('desiredSalary', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Markedsdata/lønnsstatistikk
          </label>
          <textarea
            className="min-h-[48px] w-full rounded border px-2 py-1 transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            value={form.marketData}
            placeholder="F.eks. SSB: Medianlønn for din rolle, rapporter, etc."
            onChange={e => handleChange('marketData', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Andre betingelser/goder
          </label>
          <textarea
            className="min-h-[48px] w-full rounded border px-2 py-1 transition outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            value={form.otherBenefits}
            placeholder="F.eks. bonus, ekstra ferie, fleksibilitet"
            onChange={e => handleChange('otherBenefits', e.target.value)}
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <span>Prestasjoner/resultater legges til som egne forhandlingspunkter nedenfor.</span>
      </div>
    </form>
  )
}

export default NegotiationUserInfoForm
