'use client'

import { SERIF, MONO } from '@/lib/constants/designTokens'
import BruttoNettoToggle from './BruttoNettoToggle'

interface DashboardTopBarProps {
  isNetMode: boolean
  onToggleMode: () => void
  onRequestAdd: () => void
  showKeyboardHint?: boolean
}

export default function DashboardTopBar({
  isNetMode,
  onToggleMode,
  onRequestAdd,
  showKeyboardHint = false,
}: DashboardTopBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <span style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1 }}>K</span>
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>Kjøpekraft</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BruttoNettoToggle isNetMode={isNetMode} onToggleMode={onToggleMode} />

        <button
          onClick={onRequestAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--ink)', color: '#fff',
            padding: '10px 18px', borderRadius: 12,
            fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          Legg til lønn
          {showKeyboardHint && (
            <span style={{ fontSize: 11, opacity: 0.5, marginLeft: 4, padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, fontFamily: MONO }}>
              N
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
