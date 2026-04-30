'use client'

const LABELS = ['Tynt', 'Greit', 'Solid', 'Vanntett']

export default function StrengthMeter({ strong }: { strong: number }) {
  const filled = Math.min(3, strong)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 22, height: 8, borderRadius: 3, background: i < filled ? 'var(--accent)' : 'rgba(255,255,255,0.18)', transition: 'background .2s' }} />
        ))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{LABELS[filled]}</div>
    </div>
  )
}
