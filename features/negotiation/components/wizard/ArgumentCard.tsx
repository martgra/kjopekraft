'use client'

import { useState, useEffect } from 'react'
import type { NegotiationArg } from './types'

interface ArgumentCardProps {
  arg: NegotiationArg
  onToggle: (id: string) => void
  onEdit: (id: string, body: string) => void
  onRemove?: (id: string) => void
}

const IMPACT_COLOR: Record<string, string> = {
  Sterk:      'var(--primary)',
  Middels:    '#7a5a12',
  Avgjørende: 'var(--warm)',
}

export default function ArgumentCard({ arg, onToggle, onEdit, onRemove }: ArgumentCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(arg.body)
  useEffect(() => setDraft(arg.body), [arg.body])

  return (
    <div style={{
      padding: '18px 20px',
      background: arg.selected ? 'var(--card)' : 'transparent',
      border: arg.selected ? '1px solid var(--line-strong)' : '1px dashed var(--line-strong)',
      borderRadius: 'var(--radius-md)',
      opacity: arg.selected ? 1 : 0.62,
      display: 'flex', alignItems: 'flex-start', gap: 14,
      transition: 'opacity .18s',
    }}>
      <button
        onClick={() => onToggle(arg.id)}
        style={{
          flexShrink: 0, width: 24, height: 24, borderRadius: 7, marginTop: 2,
          background: arg.selected ? 'var(--primary)' : 'transparent',
          border: arg.selected ? 'none' : '2px solid var(--line-strong)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {arg.selected && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{arg.title}</div>
          <span style={{ fontSize: 10, fontWeight: 700, color: IMPACT_COLOR[arg.impact] ?? 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {arg.impact}
          </span>
        </div>

        {!editing ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{arg.body}</p>
        ) : (
          <textarea
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={() => { onEdit(arg.id, draft); setEditing(false) }}
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { onEdit(arg.id, draft); setEditing(false) } }}
            rows={3}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--primary)', borderRadius: 10, fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)', outline: 'none', background: 'var(--paper)', resize: 'vertical', fontFamily: 'inherit' }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--ink-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{arg.icon}</span>
            {arg.source}
          </span>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Skriv om
            </button>
          )}
          {onRemove && (
            <button onClick={() => onRemove(arg.id)} style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Fjern
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
