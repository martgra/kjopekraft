import React from 'react'

export interface NegotiationPoint {
  description: string
  type: string
}

interface NegotiationPointsListProps {
  points: NegotiationPoint[]
  onRemove: (i: number) => void
}

export default function NegotiationPointsList({ points, onRemove }: NegotiationPointsListProps) {
  return (
    <div className="mt-4">
      {points.length > 0 ? (
        <div className="mb-2 font-semibold">Dine forhandlingspunkter ({points.length}):</div>
      ) : null}
      <ul className="list-disc pl-6" aria-label="Forhandlingspunkter">
        {points.length === 0 ? (
          <li className="text-gray-500 italic">Ingen punkter lagt til ennå</li>
        ) : (
          points.map((p, i) => (
            <li key={i} className="group flex items-center justify-between gap-2 py-1">
              <span className="flex-grow">
                {p.description}{' '}
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  ({p.type})
                </span>
              </span>
              <button
                type="button"
                className="rounded-full p-1 text-red-500 transition-colors hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
                onClick={() => onRemove(i)}
                aria-label={`Fjern punkt: ${p.description}`}
              >
                <span aria-hidden="true">×</span> Fjern
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
