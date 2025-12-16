'use client'

import { createTestId } from '@/lib/testing/testIds'
import type { SalaryStatistics } from '@/domain/salary'

export type BannerState = 'strongWin' | 'smallWin' | 'losing' | 'losingBadly'

interface StatusBannerProps {
  statistics: SalaryStatistics
  onCtaClick?: () => void
}

function determineBannerState(gapPercent: number): BannerState {
  // Positive gap means salary is beating inflation
  if (gapPercent >= 5) return 'strongWin'
  if (gapPercent >= 1) return 'smallWin'
  if (gapPercent >= -3) return 'losing'
  return 'losingBadly'
}

const BANNER_CONFIG = {
  strongWin: {
    icon: 'trending_up',
    badge: 'Sterk vekst',
    headline: 'Du ligger foran inflasjonen',
    description: 'Kjøpekraften din har økt. Du har fått mer å rutte med.',
    cta: 'Se hva som har gjort forskjellen',
    bgColor: 'bg-[#1F7A4D]',
    textColor: 'text-white',
    iconColor: 'text-white',
    badgeBg: 'bg-white/20',
    indicatorBg: 'bg-white/10',
  },
  smallWin: {
    icon: 'trending_up',
    badge: 'Svak fremgang',
    headline: 'Du er så vidt foran – foreløpig',
    description: 'Lønnen din har økt litt mer enn prisene. Dette kan raskt endre seg.',
    cta: 'Sjekk forhandlingspotensialet ditt',
    bgColor: 'bg-[#E6F0C9]',
    textColor: 'text-slate-800',
    iconColor: 'text-slate-700',
    badgeBg: 'bg-slate-700/10',
    indicatorBg: 'bg-slate-700/10',
  },
  losing: {
    icon: 'warning',
    badge: 'Advarsel',
    headline: 'Du taper kjøpekraft',
    description: 'Prisene stiger raskere enn lønnen din. Du får mindre igjen for pengene.',
    cta: 'På tide å gjøre noe',
    bgColor: 'bg-[#F4A261]',
    textColor: 'text-slate-900',
    iconColor: 'text-slate-900',
    badgeBg: 'bg-slate-900/10',
    indicatorBg: 'bg-slate-900/10',
  },
  losingBadly: {
    icon: 'local_fire_department',
    badge: 'Kritisk',
    headline: 'Kjøpekraften din faller',
    description: 'Inflasjonen har tatt igjen inntekten din. Å stå stille betyr å gå bakover.',
    cta: 'Forbered neste lønnssamtale',
    bgColor: 'bg-[#8B1E1E]',
    textColor: 'text-white',
    iconColor: 'text-white',
    badgeBg: 'bg-white/20',
    indicatorBg: 'bg-white/10',
  },
}

export default function StatusBanner({ statistics, onCtaClick }: StatusBannerProps) {
  const testId = createTestId('status-banner')
  const state = determineBannerState(statistics.gapPercent)
  const config = BANNER_CONFIG[state]

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick()
    }
  }

  return (
    <div
      className={`${config.bgColor} ${config.textColor} relative overflow-hidden rounded-2xl p-5 shadow-lg`}
      data-testid={testId('container')}
      data-state={state}
    >
      {/* Decorative blur element */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 opacity-20 blur-3xl"></div>

      {/* Header with icon, badge, and indicator */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className={`material-symbols-outlined text-2xl ${config.iconColor}`}>
            {config.icon}
          </span>
          <span
            className={`${config.badgeBg} rounded-full px-2 py-0.5 text-xs font-bold tracking-wider uppercase`}
          >
            {config.badge}
          </span>
        </div>

        {/* Micro-indicator */}
        <div
          className={`${config.indicatorBg} flex items-center space-x-1 rounded-lg px-2 py-1 backdrop-blur-sm`}
        >
          <span className="text-xs font-medium opacity-90">Kjøpekraft:</span>
          <span className="text-xs font-bold">
            {statistics.gapPercent > 0 ? '+' : ''}
            {statistics.gapPercent.toFixed(1)} %
          </span>
        </div>
      </div>

      {/* Headline */}
      <h2 className="mb-2 text-2xl leading-tight font-bold">{config.headline}</h2>

      {/* Supporting text */}
      <p className="mb-5 text-sm leading-relaxed opacity-90">{config.description}</p>

      {/* CTA */}
      <button
        onClick={handleCtaClick}
        className="group flex items-center text-sm font-semibold transition-all hover:translate-x-1"
        data-testid={testId('cta')}
      >
        {config.cta}
        <span className="material-symbols-outlined ml-1 text-base transition-transform group-hover:translate-x-1">
          arrow_forward
        </span>
      </button>
    </div>
  )
}
