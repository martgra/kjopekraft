'use client'

import type { SalaryStatistics } from '@/domain/salary'
import SalaryHeroCard from './SalaryHeroCard'
import NegotiationCtaCard from './NegotiationCtaCard'

interface DashboardHeroProps {
  statistics: SalaryStatistics
  currentYear: number
}

export default function DashboardHero({ statistics, currentYear }: DashboardHeroProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 24 }}>
      <SalaryHeroCard statistics={statistics} />
      <NegotiationCtaCard currentYear={currentYear} />
    </div>
  )
}
