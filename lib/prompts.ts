// promptBuilders.ts
import type {
  NegotiationEmailContext,
  NegotiationPoint,
  NegotiationUserInfo,
} from '@/lib/models/types'
import { EMAIL_EXAMPLE } from '@/lib/examples'
import { formatBenefitLabels } from '@/lib/negotiation/benefitOptions'
import { formatCurrency } from '@/lib/formatters/salaryFormatting'
import { TEXT } from '@/lib/constants/text'

export function buildEmailPrompt(
  points: NegotiationPoint[],
  userInfo?: NegotiationUserInfo,
  context?: NegotiationEmailContext,
): string {
  let userSection = ''
  if (userInfo) {
    const benefits = userInfo.benefits?.length
      ? formatBenefitLabels(userInfo.benefits).join(', ')
      : 'Ikke oppgitt'
    userSection =
      `\n\nBakgrunnsinfo fra bruker:\n` +
      `- Stillingstittel: ${userInfo.jobTitle || 'Ikke oppgitt'}\n` +
      `- Bransje: ${userInfo.industry || 'Ikke oppgitt'}\n` +
      `- Ny jobb eller justering: ${userInfo.isNewJob === null ? 'Ikke oppgitt' : userInfo.isNewJob ? 'Ny jobb' : 'Justering'}\n` +
      `- Nåværende lønn: ${userInfo.currentSalary || 'Ikke oppgitt'}\n` +
      `- Ønsket lønn: ${userInfo.desiredSalary || 'Ikke oppgitt'}\n` +
      `- Prestasjoner: ${userInfo.achievements || 'Ikke oppgitt'}\n` +
      `- Markedsdata: ${userInfo.marketData || 'Ikke oppgitt'}\n` +
      `- Ønskede goder: ${benefits}\n` +
      `- Andre goder: ${userInfo.otherBenefits || 'Ikke oppgitt'}\n`
  }

  let contextSection = ''
  if (context) {
    const historyLines = context.salaryHistory?.length
      ? context.salaryHistory
          .map(entry => {
            const reason = entry.reason ? ` (${entry.reason})` : ''
            return `- ${entry.year}: ${formatCurrency(entry.pay)} ${TEXT.common.pts}${reason}`
          })
          .join('\n')
      : ''

    const power =
      context.purchasingPower && typeof context.purchasingPower.gapPercent === 'number'
        ? `${context.purchasingPower.gapPercent >= 0 ? '+' : ''}${context.purchasingPower.gapPercent.toFixed(1)}%`
        : null
    const powerPeriod =
      context.purchasingPower?.startingYear && context.purchasingPower.latestYear
        ? `${context.purchasingPower.startingYear}–${context.purchasingPower.latestYear}`
        : null

    const reference =
      context.referenceSalary &&
      context.referenceSalary.occupationLabel &&
      context.referenceSalary.medianSalary !== null &&
      context.referenceSalary.medianYear !== null
        ? `${context.referenceSalary.occupationLabel} (${context.referenceSalary.medianYear}): ${formatCurrency(context.referenceSalary.medianSalary)} ${TEXT.common.pts}${context.referenceSalary.isApproximate ? ' (tilnærmet match)' : ''}`
        : null

    const contextLines = [
      historyLines ? `Lønnsutvikling:\n${historyLines}` : null,
      power ? `Kjøpekraftsgap ${powerPeriod ? `(${powerPeriod})` : ''}: ${power}` : null,
      reference ? `Referanselønn: ${reference}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    if (contextLines) {
      contextSection = `\n\nTilleggsdata:\n${contextLines}\n`
    }
  }
  return `Skriv en profesjonell, høflig og kulturtilpasset e-post på norsk til lønnsforhandling basert på følgende punkter:

Bruk Markdown-formatering for pent oppsett:
- Bruk **fet** for viktige punkter
- Bruk kulepunkter (- ) for lister
- Bruk tomme linjer mellom avsnitt

${points.map(p => `- ${p.description} (${p.type})`).join('\n')}${userSection}${contextSection}`
}

export function buildTextValidationPrompt(
  text: string,
  options: {
    language?: string
    maxChars?: number
    pointType?: string
    history?: { role: 'assistant' | 'user'; content: string }[]
    askedCount?: number
    maxQuestions?: number
    forceFinalize?: boolean
  } = {},
): string {
  const { language, maxChars, pointType, history, askedCount, maxQuestions, forceFinalize } =
    options
  const categoryGuide = {
    Achievement:
      'Prestasjon: Fokuser på konkrete resultater og effekt. Struktur: handling -> belegg -> effekt. Eksempel: "Jeg leverte X innen Y som ga Z." Sporsmal: Hva var resultatet? Hvilke tall/effekt? Når skjedde det?',
    Responsibility:
      'Ansvar: Fokuser pa utvidet scope, eierskap, folk/budsjett/leveranser. Struktur: ansvar -> omfang -> konsekvens. Eksempel: "Jeg tok ansvar for X og sikret Y." Sporsmal: Hvor stort ansvar? Hvilke leveranser? Hvilken effekt?',
    Market:
      'Marked: Fokuser pa markedssammenligning og rolle-niva. Struktur: markedstall -> gap -> hvorfor det er relevant. Eksempel: "Markedsdata viser Y for rollen, mitt ansvar er pa niva med dette." Sporsmal: Hvilken rolle sammenlignes? Hvilke kilder/tall? Hva er gapet?',
    Competence:
      'Kompetanse: Fokuser pa spisskompetanse brukt i praksis. Struktur: kompetanse -> anvendelse -> effekt. Eksempel: "Jeg brukte X til Y som ga Z." Sporsmal: Hvilken kompetanse? Hvordan ble den brukt? Hvilken effekt?',
    Other:
      'Annet: Fokuser pa kontekst som stabilitet, kritikalitet eller risiko. Struktur: kontekst -> bidrag -> effekt. Eksempel: "I en kritisk periode gjorde jeg X som ga Y." Sporsmal: Hvilken situasjon? Hva gjorde du? Hvilken effekt?',
  } as const
  const categoryKey =
    pointType && pointType in categoryGuide ? (pointType as keyof typeof categoryGuide) : null
  const categoryText = categoryKey ? categoryGuide[categoryKey] : null
  const instructions = [
    'Forbedre følgende tekst uten å endre mening, fakta eller tone.',
    language ? `Skriv på ${language}.` : 'Behold samme språk som originalen.',
    pointType ? `Tilpass forhandlingstype: ${pointType}.` : null,
    categoryText ? `Retningslinjer: ${categoryText}` : null,
    maxChars ? `Hold deg under ${maxChars} tegn.` : null,
    typeof maxQuestions === 'number'
      ? `Du kan stille maks ${maxQuestions} oppfolgingssporsmal.`
      : null,
    typeof askedCount === 'number' ? `Sporsmal stilt hittil: ${askedCount}.` : null,
    forceFinalize ? 'Avslutt na og returner forbedret tekst.' : null,
    'Still kun ett klart sporsmal om gangen hvis du trenger mer info.',
    'Hvis du har nok info, returner forbedret tekst.',
    'Svar med et JSON-objekt med feltene: status ("question" eller "done"), question, improvedText.',
    'Returner alltid improvedText, og kun ett question om gangen hvis du fortsatt trenger info.',
  ]
    .filter(Boolean)
    .join(' ')

  const historyBlock = history?.length
    ? `\n\nHistorikk:\n${history
        .map(entry => `- ${entry.role === 'assistant' ? 'Assistent' : 'Bruker'}: ${entry.content}`)
        .join('\n')}`
    : ''

  return `${instructions}\n\nTekst:\n${text}${historyBlock}`
}

export const SYSTEM_PROMPT_TEXT_VALIDATION = `
Du er en språkassistent som forbedrer fritekst.
- Bevar mening, fakta og tone.
- Ikke legg til ny informasjon.
- Sporsmal skal vaere konkrete, korte og tilpasset argumenttypen.
- Still maks 3 sporsmal totalt, ett om gangen.
- Hvis du har nok info, returner forbedret tekst med en gang.
- Returner et JSON-objekt med feltene: status ("question" eller "done"), question, improvedText.
- Returner alltid improvedText, selv om du stiller et oppfolgingssporsmal.
- Argumenter skal være korte, konkrete og profesjonelle.
- Bruk strukturen: påstand -> belegg -> effekt.
`

export const SYSTEM_PROMPT_EMAIL = `
Din rolle er å lage en epost der bruker legger fram ønske om lønnsforhandlinger. Du skal hjelpe bruker å lage
et best mulig utkast.

1. Sørg for at eposten er konsis og to the point.
2. Sørg for at det er tydelig der bruker må fylle inn informasjon slik som navn på mottaker, eget navn, detaljer om egen stilling eller lignende.
3. Sørg for at epost er tett knyttet til data bruker selv spiller inn som viktige.

E-posten skal:
- Være strukturert med en innledning som uttrykker takknemlighet og entusiasme.
- Tydelig beskrive ønsket lønnsjustering med konkrete og saklige begrunnelser (erfaring, ansvar, resultater, markedsdata).
- Bruke et høflig, direkte og samarbeidsorientert språk som samsvarer med norske normer for arbeidslivet.
- Avsluttes med en positiv forventning om videre dialog.
- Kun data du selv synes er relevant bør inkluderes i mail-forslaget og som bygger opp under ønsket lønn.

**VIKTIG:** Svar med **Markdown-formatert** tekst. Bruk:
- Tomme linjer mellom avsnitt
- **Fet tekst** for viktige punkter  
- Kulepunkter (- ) for lister
- Start med emne-linje: **Emne:** [tittel]

${EMAIL_EXAMPLE}

Svar med en komplett e-post i Markdown-format.
`
