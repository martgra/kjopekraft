'use client'

import { useState, useEffect } from 'react'
import { MONO } from '@/lib/constants/designTokens'

interface YearStepperProps {
  value: number
  onChange: (y: number) => void
  min: number
  max: number
}

export default function YearStepper({ value, onChange, min, max }: YearStepperProps) {
  const [text, setText] = useState(String(value))

  useEffect(() => { setText(String(value)) }, [value])

  const commit = (raw: string) => {
    const n = parseInt(raw.replace(/\D/g, ''), 10)
    if (!Number.isFinite(n)) return
    const clamped = Math.max(min, Math.min(max, n))
    onChange(clamped)
    setText(String(clamped))
  }

  const step = (delta: number) => {
    const next = value + delta
    if (next < min || next > max) return
    onChange(next)
  }

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 44, flexShrink: 0, borderRadius: 12,
    background: 'var(--card)', border: '1px solid var(--line)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: disabled ? 'var(--ink-muted)' : 'var(--ink)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'inherit',
  })

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, minWidth: 0 }}>
      <button type="button" onClick={() => step(-1)} disabled={value <= min} style={btnStyle(value <= min)}>
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>remove</span>
      </button>
      <input
        type="text" inputMode="numeric" pattern="[0-9]*"
        value={text}
        onChange={e => setText(e.target.value.replace(/\D/g, '').slice(0, 4))}
        onBlur={() => commit(text)}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        onFocus={e => e.currentTarget.select()}
        aria-label="År"
        style={{
          flex: 1, minWidth: 0, width: 0, textAlign: 'center',
          background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 12,
          outline: 'none',
          fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em',
          padding: '10px 8px', color: 'var(--ink)',
          fontFamily: MONO,
        }}
      />
      <button type="button" onClick={() => step(1)} disabled={value >= max} style={btnStyle(value >= max)}>
        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add</span>
      </button>
    </div>
  )
}
