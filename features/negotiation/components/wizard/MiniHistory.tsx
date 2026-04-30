'use client'

import type { PayPoint } from '@/domain/salary'
import { MONO } from '@/lib/constants/designTokens'

export default function MiniHistory({ payPoints }: { payPoints: PayPoint[] }) {
  const points = [...payPoints].sort((a, b) => a.year - b.year)
  if (points.length < 2) return null

  const W = 260, H = 90, P = 8
  const minP = Math.min(...points.map(p => p.pay))
  const maxP = Math.max(...points.map(p => p.pay))
  const range = maxP - minP || 1
  const xs = (i: number) => P + (i / (points.length - 1)) * (W - P * 2)
  const ys = (v: number) => H - P - ((v - minP) / range) * (H - P * 2)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xs(i)} ${ys(p.pay)}`).join(' ')
  const area = `${path} L ${xs(points.length - 1)} ${H - P} L ${xs(0)} ${H - P} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 90, display: 'block' }}>
        <defs>
          <linearGradient id="miniHistFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a6f3a" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2a6f3a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#miniHistFill)" />
        <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={p.year}
            cx={xs(i)} cy={ys(p.pay)}
            r={i === points.length - 1 ? 4 : 2.5}
            fill="#fff" stroke="var(--primary)"
            strokeWidth={i === points.length - 1 ? 2.5 : 1.5}
          />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-muted)', marginTop: 4, fontFamily: MONO }}>
        <span>{points[0]?.year}</span>
        <span>{points[points.length - 1]?.year}</span>
      </div>
    </div>
  )
}
