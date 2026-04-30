'use client'

import { SERIF } from '@/lib/constants/designTokens'

type Tone = 'positive' | 'warm' | 'neutral' | 'muted'

interface SignalPillProps {
  icon: string
  label: string
  value: string
  sub: string
  tone?: Tone
}

const TONE_COLOR: Record<Tone, string> = {
  positive: 'var(--primary)',
  warm:     'var(--warm)',
  neutral:  'var(--ink)',
  muted:    'var(--ink-muted)',
}

export default function SignalPill({ icon: _icon, label, value, sub, tone = 'neutral' }: SignalPillProps) {
  return (
    <div style={{ padding: '12px 14px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: 24, lineHeight: 1, fontFamily: SERIF, color: TONE_COLOR[tone] }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{sub}</div>
    </div>
  )
}
