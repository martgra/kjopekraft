import React from 'react'

interface NegotiationPointsInputProps {
  desc: string
  setDesc: (v: string) => void
  type: string
  setType: (v: string) => void
  onAdd: () => void
  text: {
    descriptionPlaceholder: string
    typePlaceholder: string
    typeAchievement: string
    typeMarket: string
    typeResponsibility: string
    typeCertification: string
    typeExperience: string
    addButton: string
  }
}

const inputBaseClasses =
  'rounded-lg border border-[var(--border-light)] bg-white text-[var(--text-main)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] text-sm transition-colors'

export default function NegotiationPointsInput({
  desc,
  setDesc,
  type,
  setType,
  onAdd,
  text,
}: NegotiationPointsInputProps) {
  return (
    <div className="flex flex-col items-start gap-4 md:flex-row md:items-stretch">
      <textarea
        className={`${inputBaseClasses} flex-1 resize-none px-4 py-3`}
        placeholder={text.descriptionPlaceholder}
        value={desc}
        onChange={e => setDesc(e.target.value)}
        aria-label="Forhandlingspunkt beskrivelse"
        rows={3}
      />
      <div className="flex w-full flex-col gap-4 md:w-48">
        <select
          className={`${inputBaseClasses} h-[50px] w-full px-3 py-3`}
          value={type}
          onChange={e => setType(e.target.value)}
          aria-label="Velg type forhandlingspunkt"
        >
          <option value="">{text.typePlaceholder}</option>
          <option value="Achievement">{text.typeAchievement}</option>
          <option value="Experience">{text.typeExperience}</option>
          <option value="Market Data">{text.typeMarket}</option>
          <option value="Responsibility">{text.typeResponsibility}</option>
          <option value="Certification">{text.typeCertification}</option>
        </select>
        <button
          type="button"
          className="flex h-[42px] items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onAdd}
          disabled={!desc || !type}
          aria-label="Legg til forhandlingspunkt"
        >
          {text.addButton}
        </button>
      </div>
    </div>
  )
}
