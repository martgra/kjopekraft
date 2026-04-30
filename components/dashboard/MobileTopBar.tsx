'use client'

import Link from 'next/link'
import { SERIF } from '@/lib/constants/designTokens'

export default function MobileTopBar() {
  return (
    <div style={{ padding: 'calc(env(safe-area-inset-top) + 12px) 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <span style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1 }}>K</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Kjøpekraft</div>
      </div>
      <Link href="/settings" aria-label="Innstillinger">
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--ink)' }}>person</span>
        </div>
      </Link>
    </div>
  )
}
