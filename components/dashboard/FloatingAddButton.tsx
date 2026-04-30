'use client'

import { SANS } from '@/lib/constants/designTokens'

interface FloatingAddButtonProps {
  onClick: () => void
  label?: string
}

export default function FloatingAddButton({ onClick, label = 'Legg til lønn' }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', right: 20, bottom: 'calc(env(safe-area-inset-bottom) + 24px)',
        zIndex: 20,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 20px', borderRadius: 999,
        background: 'var(--ink)', color: '#fff',
        fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer',
        boxShadow: '0 10px 30px -8px rgba(20,22,19,0.5)',
        fontFamily: SANS,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>add</span>
      {label}
    </button>
  )
}
