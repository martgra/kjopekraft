import React from 'react'
import { TEXT } from '@/lib/constants/text'

export interface NegotiationPoint {
  description: string
  type: string
}

interface NegotiationPointsListProps {
  points: NegotiationPoint[]
  onRemove: (i: number) => void
}

export default function NegotiationPointsList({ points, onRemove }: NegotiationPointsListProps) {
  if (points.length === 0) {
    return (
      <div className="py-2">
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]"></span>
          <span className="text-sm italic">{TEXT.negotiation.noPointsYet}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="mb-3 text-sm font-semibold text-[var(--text-main)]">
        {TEXT.negotiation.yourPoints} ({points.length}):
      </div>
      <ul className="space-y-2" aria-label="Forhandlingspunkter">
        {points.map((p, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-3 rounded-lg border border-[var(--border-light)] bg-[var(--background-light)] p-3"
          >
            <div className="flex-grow">
              <p className="text-sm text-[var(--text-main)]">{p.description}</p>
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {p.type}
              </span>
            </div>
            <button
              type="button"
              className="shrink-0 text-sm text-red-500 transition-colors hover:text-red-700"
              onClick={() => onRemove(i)}
              aria-label={`Fjern punkt: ${p.description}`}
            >
              <span className="material-icons text-lg">close</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
