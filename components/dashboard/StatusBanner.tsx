'use client'

import { useEffect, useState } from 'react'
import { createTestId } from '@/lib/testing/testIds'
import type { PayPoint, SalaryStatistics } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'
import { useIsMobile } from '@/lib/hooks/useIsMobile'

export type BannerState =
  | 'strongWin'
  | 'smallWin'
  | 'losing'
  | 'losingBadly'
  | 'singlePoint'
  | 'singlePointNewJob'
  | 'demoMode'

interface StatusBannerProps {
  payPoints?: PayPoint[]
  statistics: SalaryStatistics
  isDemoMode?: boolean
  onCtaClick?: () => void
  onSinglePointCtaClick?: () => void
  onDemoModeCtaClick?: () => void
}

function determineBannerState(gapPercent: number): BannerState {
  // Positive gap means salary is beating inflation
  if (gapPercent >= 5) return 'strongWin'
  if (gapPercent >= 1) return 'smallWin'
  if (gapPercent >= -3) return 'losing'
  return 'losingBadly'
}

const BANNER_CONFIG: Record<
  BannerState,
  {
    icon: string
    bgColor: string
    textColor: string
    iconColor: string
    badgeBg: string
    indicatorBg: string
    showIndicator?: boolean
  }
> = {
  strongWin: {
    icon: 'trending_up',
    bgColor: 'bg-[#1F7A4D]',
    textColor: 'text-white',
    iconColor: 'text-white',
    badgeBg: 'bg-white/20',
    indicatorBg: 'bg-white/10',
  },
  smallWin: {
    icon: 'trending_up',
    bgColor: 'bg-[#E6F0C9]',
    textColor: 'text-slate-800',
    iconColor: 'text-slate-700',
    badgeBg: 'bg-slate-700/10',
    indicatorBg: 'bg-slate-700/10',
  },
  losing: {
    icon: 'warning',
    bgColor: 'bg-[#F4A261]',
    textColor: 'text-slate-900',
    iconColor: 'text-slate-900',
    badgeBg: 'bg-slate-900/10',
    indicatorBg: 'bg-slate-900/10',
  },
  losingBadly: {
    icon: 'local_fire_department',
    bgColor: 'bg-[#8B1E1E]',
    textColor: 'text-white',
    iconColor: 'text-white',
    badgeBg: 'bg-white/20',
    indicatorBg: 'bg-white/10',
  },
  singlePoint: {
    icon: 'add_circle',
    bgColor: 'bg-[#E8F0FE]',
    textColor: 'text-slate-900',
    iconColor: 'text-slate-900',
    badgeBg: 'bg-slate-900/10',
    indicatorBg: 'bg-slate-900/10',
    showIndicator: false,
  },
  singlePointNewJob: {
    icon: 'workspace_premium',
    bgColor: 'bg-[#EEF4EA]',
    textColor: 'text-slate-900',
    iconColor: 'text-slate-900',
    badgeBg: 'bg-slate-900/10',
    indicatorBg: 'bg-slate-900/10',
    showIndicator: false,
  },
  demoMode: {
    icon: 'science',
    bgColor: 'bg-[#E9F2FF]',
    textColor: 'text-slate-900',
    iconColor: 'text-slate-900',
    badgeBg: 'bg-slate-900/10',
    indicatorBg: 'bg-slate-900/10',
    showIndicator: false,
  },
}

export default function StatusBanner({
  payPoints = [],
  statistics,
  isDemoMode = false,
  onCtaClick,
  onSinglePointCtaClick,
  onDemoModeCtaClick,
}: StatusBannerProps) {
  const testId = createTestId('status-banner')
  const isSinglePoint = payPoints.length === 1
  const isNewJob = isSinglePoint && payPoints[0]?.reason === 'newJob'
  const isMobile = useIsMobile()
  const state: BannerState = isDemoMode
    ? 'demoMode'
    : isSinglePoint
      ? isNewJob
        ? 'singlePointNewJob'
        : 'singlePoint'
      : determineBannerState(statistics.gapPercent)
  const config = BANNER_CONFIG[state]
  const [isExpanded, setIsExpanded] = useState(true)
  const bannerText = TEXT.dashboard.statusBanner[state]
  const showIndicator = config.showIndicator !== false
  const isLightBanner = ['smallWin', 'singlePoint', 'singlePointNewJob', 'demoMode'].includes(state)
  const borderClass = isLightBanner ? 'border border-slate-200/80' : 'border border-white/10'
  const shadowClass = isLightBanner
    ? 'shadow-[0_18px_30px_-22px_rgba(15,23,42,0.25)]'
    : 'shadow-[0_18px_30px_-22px_rgba(0,0,0,0.55)]'
  const ctaClass = isLightBanner ? 'text-slate-900' : 'text-white'

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false)
    }
  }, [isMobile])

  const handleCtaClick = () => {
    if (isDemoMode) {
      onDemoModeCtaClick?.()
      return
    }
    if (isSinglePoint) {
      onSinglePointCtaClick?.()
      return
    }
    onCtaClick?.()
  }

  return (
    <div
      className={`${config.bgColor} ${config.textColor} ${borderClass} ${shadowClass} relative overflow-hidden rounded-3xl p-4`}
      data-testid={testId('container')}
      data-state={state}
    >
      {/* Decorative blur element */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 opacity-20 blur-3xl"></div>

      {/* Header with icon, badge, indicator, and expand/collapse button */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className={`material-symbols-outlined text-xl ${config.iconColor}`}>
            {config.icon}
          </span>
          <span
            className={`${config.badgeBg} rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase`}
          >
            {bannerText.badge}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Micro-indicator */}
          {showIndicator && (
            <div
              className={`${config.indicatorBg} flex items-center space-x-1 rounded-lg px-2 py-1 backdrop-blur-sm`}
            >
              <span className="text-[11px] font-medium opacity-90">
                {TEXT.dashboard.statusBanner.purchasingPowerLabel}
              </span>
              <span className="text-[11px] font-bold">
                {statistics.gapPercent > 0 ? '+' : ''}
                {statistics.gapPercent.toFixed(1)} %
              </span>
            </div>
          )}

          {/* Expand/Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="transition-transform hover:scale-110"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? TEXT.dashboard.statusBanner.hideDetails
                : TEXT.dashboard.statusBanner.showDetails
            }
            data-testid={testId('toggle')}
          >
            <span className={`material-symbols-outlined text-lg ${config.iconColor}`}>
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Headline */}
      <h2 className="mb-1 text-xl leading-tight font-bold">{bannerText.headline}</h2>

      {/* Supporting text */}
      {isExpanded && (
        <p className="mb-4 text-xs leading-relaxed opacity-90">{bannerText.description}</p>
      )}

      {/* CTA (always visible) */}
      <button
        onClick={handleCtaClick}
        className={`group flex items-center text-xs font-semibold transition-all hover:translate-x-1 ${ctaClass}`}
        data-testid={testId('cta')}
      >
        {bannerText.cta}
        <span className="material-symbols-outlined ml-1 text-sm transition-transform group-hover:translate-x-1">
          arrow_forward
        </span>
      </button>
    </div>
  )
}
