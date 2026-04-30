'use client'

interface BruttoNettoToggleProps {
  isNetMode: boolean
  onToggleMode: () => void
  size?: 'md' | 'sm'
}

export default function BruttoNettoToggle({ isNetMode, onToggleMode, size = 'md' }: BruttoNettoToggleProps) {
  const config = size === 'sm'
    ? { padX: 10, padY: 4, fontSize: 11, padding: 2 }
    : { padX: 14, padY: 6, fontSize: 13, padding: 3 }

  const tab = (active: boolean): React.CSSProperties => ({
    padding: `${config.padY}px ${config.padX}px`,
    borderRadius: 999,
    background: active ? 'var(--card)' : 'transparent',
    color: active ? 'var(--ink)' : 'var(--ink-muted)',
    boxShadow: active && size === 'md' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: config.fontSize,
    fontWeight: 600,
    transition: 'all .15s',
  })

  return (
    <div style={{ display: 'flex', background: 'var(--paper-2)', borderRadius: 999, padding: config.padding, fontSize: config.fontSize, fontWeight: 600 }}>
      <button onClick={() => isNetMode && onToggleMode()} style={tab(!isNetMode)}>Brutto</button>
      <button onClick={() => !isNetMode && onToggleMode()} style={tab(isNetMode)}>Netto</button>
    </div>
  )
}
