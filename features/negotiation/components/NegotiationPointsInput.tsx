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
    addButton: string
  }
}

export default function NegotiationPointsInput({
  desc,
  setDesc,
  type,
  setType,
  onAdd,
  text,
}: NegotiationPointsInputProps) {
  return (
    <div className="flex flex-col items-stretch gap-2 md:flex-row">
      <textarea
        className="min-h-[80px] flex-1 resize-y rounded border px-2 py-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder={text.descriptionPlaceholder}
        value={desc}
        onChange={e => setDesc(e.target.value)}
        aria-label="Forhandlingspunkt beskrivelse"
      />
      <select
        className="min-w-[160px] rounded border px-2 py-1 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        value={type}
        onChange={e => setType(e.target.value)}
        aria-label="Velg type forhandlingspunkt"
      >
        <option value="">{text.typePlaceholder}</option>
        <option value="Achievement">{text.typeAchievement}</option>
        <option value="Market Data">{text.typeMarket}</option>
        <option value="Responsibility">{text.typeResponsibility}</option>
        <option value="Certification">{text.typeCertification}</option>
      </select>
      <button
        type="button"
        className="self-end rounded bg-blue-600 px-3 py-1 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        onClick={onAdd}
        disabled={!desc || !type}
        aria-label="Legg til forhandlingspunkt"
      >
        {text.addButton}
      </button>
    </div>
  )
}
