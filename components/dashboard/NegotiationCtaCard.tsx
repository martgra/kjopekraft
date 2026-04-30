'use client'

import Link from 'next/link'
import { SERIF } from '@/lib/constants/designTokens'

interface NegotiationCtaCardProps {
  currentYear: number
  variant?: 'desktop' | 'mobile'
}

export default function NegotiationCtaCard({ currentYear, variant = 'desktop' }: NegotiationCtaCardProps) {
  const isMobile = variant === 'mobile'

  return (
    <Link href="/negotiation" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'linear-gradient(135deg, #2a6f3a, #1e5129)',
        color: '#fff', borderRadius: isMobile ? 18 : 'var(--radius-lg)',
        padding: isMobile ? '16px 20px' : 24,
        position: 'relative', overflow: 'hidden',
        height: '100%', minHeight: isMobile ? 0 : 160,
        display: 'flex', flexDirection: isMobile ? 'row' : 'column',
        alignItems: isMobile ? 'center' : 'stretch',
        justifyContent: 'space-between', gap: 12,
        cursor: 'pointer',
      }}>
        {!isMobile && (
          <div style={{ position: 'absolute', right: -30, top: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.8, marginBottom: isMobile ? 4 : 8 }}>
            Forhandling {currentYear}
          </div>
          <div style={{ fontFamily: SERIF, fontSize: isMobile ? 18 : 26, lineHeight: 1.15, marginBottom: isMobile ? 0 : 16, fontWeight: 400 }}>
            Tiden for neste lønnsjustering nærmer seg.
          </div>
          {!isMobile && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' }}>
              Se forhandlingsgrunnlag
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </div>
          )}
        </div>
        {isMobile && (
          <span className="material-symbols-outlined" style={{ fontSize: 24, opacity: 0.9, flexShrink: 0 }}>arrow_forward</span>
        )}
      </div>
    </Link>
  )
}
