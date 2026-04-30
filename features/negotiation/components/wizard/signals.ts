import { useMemo } from 'react'
import type { PayPoint, SalaryStatistics } from '@/domain/salary'
import type { InflationDataPoint } from '@/domain/inflation'
import type { ScenarioId, Scenario, NegotiationArg } from './types'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'

// Re-export under the wizard-local name kept for clarity at call sites.
export const fmtKr = (n: number) => formatCurrency(n)

export type Signals = {
  current: number
  nominalGrowth: number
  realGrowth: number
  marketGap: number | null
  inflation: number
  monthsSinceLastRaise: number
  scenarios: Record<ScenarioId, Scenario>
}

export function useSignals(
  statistics: SalaryStatistics | null,
  inflationData: InflationDataPoint[],
  medianSalary: number | null,
  inflationGapPercent: number | null,
  payPoints: PayPoint[],
  currentYear: number,
): Signals | null {
  return useMemo(() => {
    if (!statistics?.latestPay || !payPoints.length) return null
    const current = statistics.latestPay
    const nominalGrowth =
      statistics.startingPay > 0
        ? Math.round(((current - statistics.startingPay) / statistics.startingPay) * 1000) / 10
        : 0
    const realGrowth = inflationGapPercent !== null ? Math.round(inflationGapPercent * 10) / 10 : 0
    const marketGap =
      medianSalary !== null
        ? Math.round(((current - medianSalary) / medianSalary) * 1000) / 10
        : null
    const latestInflationPoint = inflationData.reduce<InflationDataPoint | null>(
      (acc, p) => (!acc || p.year > acc.year ? p : acc),
      null,
    )
    const inflation = latestInflationPoint ? Math.round(latestInflationPoint.inflation * 10) / 10 : 2.5
    const sorted = [...payPoints].sort((a, b) => a.year - b.year)
    const latestYear = sorted[sorted.length - 1]?.year ?? currentYear
    const monthsSinceLastRaise = (currentYear - latestYear) * 12

    const conservativePct = Math.round(inflation * 10) / 10
    const conservativeKr = Math.round((current * (1 + conservativePct / 100)) / 1000) * 1000
    const catchUp = Math.max(0, -realGrowth)
    const targetPct = Math.round((catchUp + inflation) * 10) / 10
    const targetKr = Math.round((current * (1 + targetPct / 100)) / 1000) * 1000
    const hasMarket = medianSalary !== null
    const stretchToMarketPct = hasMarket ? ((medianSalary! - current) / current) * 100 : 0
    const stretchPct = hasMarket
      ? Math.round(Math.max(targetPct + 1.5, stretchToMarketPct) * 10) / 10
      : null
    const stretchKr = hasMarket
      ? Math.round((current * (1 + stretchPct! / 100)) / 1000) * 1000
      : null

    const scenarios: Record<ScenarioId, Scenario> = {
      conservative: { id: 'conservative', label: 'Forsiktig', sublabel: 'Matcher inflasjonen', pct: conservativePct, kr: conservativeKr, rationale: 'Sikrer at kjøpekraften din ikke svekkes neste år.', confidence: 'høy', confidenceCopy: 'Vanskelig å si nei til.' },
      target: { id: 'target', label: 'Mål', sublabel: 'Lukker gapet', pct: targetPct, kr: targetKr, rationale: 'Tar igjen inflasjonsgapet og dekker neste års prisvekst.', confidence: 'rimelig', confidenceCopy: 'Krever et godt argument, men dataene støtter deg.' },
      stretch: hasMarket
        ? { id: 'stretch', label: 'Strekkmål', sublabel: 'Treffer markedet', pct: stretchPct!, kr: stretchKr!, rationale: 'Bringer deg opp til markedsmedianen.', confidence: 'krever forberedelse', confidenceCopy: 'Marked og prestasjoner må gjøre tunge løft.' }
        : { id: 'stretch', label: 'Strekkmål', sublabel: 'Treffer markedet', pct: 0, kr: null, rationale: 'Trenger yrket ditt for å regne ut markedsmedianen.', confidence: 'låst', confidenceCopy: 'Velg yrke for å låse opp.', locked: true },
    }

    return { current, nominalGrowth, realGrowth, marketGap, inflation, monthsSinceLastRaise, scenarios }
  }, [statistics, inflationData, medianSalary, inflationGapPercent, payPoints, currentYear])
}

export function buildSuggestedArgs(
  signals: Signals,
  scenarioId: ScenarioId,
  medianSalary: number | null,
  occupationLabel: string | null,
  medianYear: number | null,
): NegotiationArg[] {
  const { current, nominalGrowth, realGrowth, inflation, monthsSinceLastRaise } = signals
  const args: NegotiationArg[] = []

  args.push({ id: 'inflasjon-gap', title: 'Reell lønn har stått stille', body: `Siden starten av perioden har nominell lønn steget ${nominalGrowth}%, men prisene har steget mer. Reelt sett har kjøpekraften ${realGrowth >= 0 ? 'økt med' : 'falt'} ${Math.abs(realGrowth).toFixed(1)}%.`, impact: 'Sterk', icon: 'trending_down', selected: true, source: 'Lønnshistorikk + KPI (SSB)' })

  if (medianSalary !== null) {
    const gapPct = Math.abs(((current - medianSalary) / medianSalary) * 100).toFixed(1)
    const direction = current < medianSalary ? 'under' : 'over'
    args.push({ id: 'marked', title: `${gapPct}% ${direction} markedsmedian`, body: `Median for ${occupationLabel ?? 'din yrkesgruppe'} (SSB ${medianYear ?? ''}) er ${fmtKr(medianSalary)} kr. Du tjener ${fmtKr(current)} kr.`, impact: 'Sterk', icon: 'public', selected: scenarioId === 'stretch' || scenarioId === 'target', source: `SSB ${medianYear ?? ''}` })
  }

  args.push({ id: 'inflasjon-neste', title: `Forventet prisvekst er ${inflation}%`, body: 'Et lønnstillegg under dette betyr i praksis et lønnskutt målt i kjøpekraft.', impact: 'Middels', icon: 'trending_up', selected: true, source: 'Norges Bank-prognose' })

  if (monthsSinceLastRaise > 12) {
    args.push({ id: 'historikk', title: `${monthsSinceLastRaise} måneder siden sist justering`, body: 'Lønnsforhandling er vanligvis årlig. Du har stått over én syklus.', impact: 'Middels', icon: 'event', selected: false, source: 'Din lønnshistorikk' })
  }

  args.push({ id: 'prestasjoner', title: 'Du leverer over rolle', body: 'Skriv kort om resultater siste 12 måneder — leveranser, ansvar, mentorering. Konkrete tall slår superlativer.', impact: 'Avgjørende', icon: 'workspace_premium', selected: scenarioId === 'stretch', source: 'Du fyller inn' })

  return args
}

export function buildEmailTemplate(
  scenario: Scenario,
  selectedArgs: NegotiationArg[],
  userName: string,
  current: number,
): string {
  const greeting = `Hei,`
  const intro = `Jeg vil gjerne avtale en lønnssamtale i forbindelse med årets lønnsjustering. Etter å ha gått gjennom lønnshistorikken min sammen med markedsdata og prisutvikling, vil jeg foreslå en justering på ${scenario.pct}% — fra ${fmtKr(current)} kr til ${fmtKr(scenario.kr ?? current)} kr.`
  const argLines = selectedArgs.length === 0 ? '' : '\n\nGrunnlaget mitt:\n' + selectedArgs.map(a => `• ${a.title}. ${a.body}`).join('\n')
  const closing = `\n\nJeg setter pris på om du kan finne tid til en samtale i løpet av de neste to ukene. Si gjerne fra hvilke tidspunkter som passer.\n\nMvh,\n${userName || '[Ditt navn]'}`
  return `${greeting}\n\n${intro}${argLines}${closing}`
}
