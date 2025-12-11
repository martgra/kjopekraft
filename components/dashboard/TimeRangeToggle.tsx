'use client'

export type TimeRange = '1Y' | '3Y' | 'ALL'

interface TimeRangeToggleProps {
  selected: TimeRange
  onChange: (range: TimeRange) => void
}

const ranges: TimeRange[] = ['1Y', '3Y', 'ALL']

export default function TimeRangeToggle({ selected, onChange }: TimeRangeToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-[var(--background-light)] p-1">
      {ranges.map(range => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`rounded-md px-3 py-1 text-xs font-bold transition-colors ${
            selected === range
              ? 'bg-white text-[var(--text-main)] shadow'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  )
}
