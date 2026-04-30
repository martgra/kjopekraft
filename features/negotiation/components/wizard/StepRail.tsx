'use client'

const STEP_LABELS = ['Tallet', 'Argumentene', 'E-posten']

export function StepRail({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 8 }}>
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1
        const done = idx < step
        const active = idx === step
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--primary)' : active ? 'var(--ink)' : 'transparent', border: !done && !active ? '1.5px solid var(--line-strong)' : 'none', color: done || active ? '#fff' : 'var(--ink-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {done ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span> : idx}
            </div>
            <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? 'var(--ink)' : done ? 'var(--ink-soft)' : 'var(--ink-muted)' }}>
              {label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function StepPips({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[1, 2, 3].map(idx => {
        const done = idx < step
        const active = idx === step
        return (
          <div key={idx} style={{ width: active ? 22 : 6, height: 6, borderRadius: 3, background: done ? 'var(--primary)' : active ? 'var(--ink)' : 'var(--line-strong)', transition: 'width .25s, background .25s' }} />
        )
      })}
    </div>
  )
}
