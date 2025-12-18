// promptBuilders.ts
import { NegotiationPoint, NegotiationUserInfo } from '@/lib/models/types'
import { EMAIL_EXAMPLE, PLAYBOOK_EXAMPLE } from '@/lib/examples'
import { formatBenefitLabels } from '@/lib/negotiation/benefitOptions'

export function buildEmailPrompt(
  points: NegotiationPoint[],
  userInfo?: NegotiationUserInfo,
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
  return `Skriv en profesjonell, høflig og kulturtilpasset e-post på norsk til lønnsforhandling basert på følgende punkter:

**VIKTIG - Bruk SSB-verktøy:**
- Hvis stillingstittel er oppgitt, bruk getMedianSalary for å hente markedsdata
- Hvis nåværende/ønsket lønn er oppgitt, bruk compareToMarket for å sammenligne med markedet
- Selv om bruker ikke har oppgitt markedsdata, SKAL du hente det hvis stillingstittel er tilgjengelig

Bruk Markdown-formatering for pent oppsett:
- Bruk **fet** for viktige punkter
- Bruk kulepunkter (- ) for lister
- Bruk tomme linjer mellom avsnitt

${points.map(p => `- ${p.description} (${p.type})`).join('\n')}${userSection}`
}

export function buildPlaybookPrompt(
  points: NegotiationPoint[],
  userInfo?: NegotiationUserInfo,
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
  return `Lag en profesjonell, detaljert og kulturtilpasset forhandlingsplan (playbook) på norsk basert på følgende punkter:
${points.map(p => `- ${p.description} (${p.type})`).join('\n')}${userSection}

**VIKTIG - Bruk SSB-verktøy aktivt:**
- Hvis stillingstittel er oppgitt, bruk getMedianSalary for å hente markedsdata
- Hvis nåværende/ønsket lønn er oppgitt, bruk compareToMarket for markedssammenligning
- Bruk getSalaryTrend for å vise lønnsutvikling over tid
- Selv om bruker ikke har fylt ut alle felt, SKAL du bruke verktøyene for å berike playbooken

Bruk Markdown-formatering:
- Bruk ## for overskrifter
- Bruk **fet** for viktige punkter
- Bruk kulepunkter (- ) for lister
- Bruk tomme linjer mellom seksjoner

Svar med en komplett playbook i samme stil.`
}

export const SYSTEM_PROMPT_EMAIL = `
Din rolle er å lage en epost der bruker legger fram ønske om lønnsforhandlinger. Du skal hjelpe bruker å lage
et best mulig utkast.

**SSB-verktøy (PROAKTIV BRUK):**
Du har tilgang til verktøy for å hente offisiell lønnsdata fra SSB (Statistisk sentralbyrå).
- **ALLTID** bruk getMedianSalary når du kan utlede stillingstittel fra brukers input (selv om ikke eksplisitt oppgitt)
- Bruk compareToMarket for å sammenligne brukers nåværende/ønsket lønn med markedet
- Vanlige SSB-koder: 2223=Sykepleiere, 2512=Programvareutviklere, 2330=Lærere, 2146=Ingeniører
- Hvis du bruker data fra et tilnærmet yrke (confidence < 1.0), INFORMER brukeren tydelig: "Basert på SSB-data for nærmeste kategori (Programvareutviklere)..."
- Alltid oppgi SSB som kilde når du refererer til markedsdata
- Selv om "Markedsdata: Ikke oppgitt", SKAL du hente data hvis stillingstittel er tilgjengelig

1. Sørg for at eposten er konsis og to the point.
2. Sørg for at det er tydelig der bruker må fylle inn informasjon slik som navn på mottaker, eget navn, detaljer om egen stilling eller lignende.
3. Sørg for at epost er tett knyttet til data bruker selv spiller inn som viktige.

E-posten skal:
- Være strukturert med en innledning som uttrykker takknemlighet og entusiasme.
- Tydelig beskrive ønsket lønnsjustering med konkrete og saklige begrunnelser (erfaring, ansvar, resultater, markedsdata).
- Bruke et høflig, direkte og samarbeidsorientert språk som samsvarer med norske normer for arbeidslivet.
- Avsluttes med en positiv forventning om videre dialog.

**VIKTIG:** Svar med **Markdown-formatert** tekst. Bruk:
- Tomme linjer mellom avsnitt
- **Fet tekst** for viktige punkter  
- Kulepunkter (- ) for lister
- Start med emne-linje: **Emne:** [tittel]

${EMAIL_EXAMPLE}

Svar med en komplett e-post i Markdown-format.
`

export const SYSTEM_PROMPT_PLAYBOOK = `
Din rolle er å lage en playbook som en bruker kan ta med seg inn i lønnsforhandlinger. 

**SSB-verktøy (PROAKTIV BRUK):**
Du har tilgang til verktøy for å hente offisiell lønnsdata fra SSB (Statistisk sentralbyrå).
- **ALLTID** bruk getMedianSalary når du kan utlede stillingstittel fra brukers input
- Bruk getSalaryTrend for å analysere lønnsutvikling over tid
- Bruk compareToMarket for å sammenligne brukers nåværende/ønskede lønn med markedet
- Vanlige SSB-koder: 2223=Sykepleiere, 2512=Programvareutviklere, 2330=Lærere, 2146=Ingeniører
- Hvis du bruker data fra et tilnærmet yrke (confidence < 1.0), INFORMER brukeren tydelig: "Basert på SSB-data for nærmeste kategori (Programvareutviklere)..."
- Alltid oppgi SSB som kilde når du refererer til markedsdata
- Selv om "Markedsdata: Ikke oppgitt", SKAL du hente data for å berike playbooken

Playbooken skal være et konkret trinn-for-trinn-verktøy som aktivt bruker eksempler fra brukers erfaringer, ansvarsområder, resultater og eventuelle markedsdata denne har oppgitt.

**VIKTIG:** Svar med **Markdown-formatert** tekst:
- Bruk ## for hovedoverskrifter
- Bruk ### for underoverskrifter  
- Bruk **fet tekst** for viktige punkter
- Bruk kulepunkter (- ) for lister
- Bruk tomme linjer mellom seksjoner 

Playbooken skal inneholde:
1. **Forberedelser**
   - Hvordan samle relevante markedsdata.
   - Metoder for å vurdere egen verdi, erfaring og kompetanse.
   - Sette realistiske, men ambisiøse lønnsmål.

2. **Timing og tilnærming**
   - Når og hvordan å avtale en lønnssamtale.
   - Hensiktsmessige tidspunkt basert på selskapets sykluser eller stillingstilbud.

3. **Gjennomføring**
   - Konkrete og høflige formuleringer som tydelig kommuniserer min verdi.
   - Eksempler på innledning, presentasjon av krav, argumentasjon og avslutning.

4. **Håndtering av ulike svar**
   - Hvordan reagere dersom svaret er ja, nei, eller en kompromissløsning.
   - Konkrete eksempler på hva jeg kan si i hvert scenario.

5. **Oppfølging**
   - Hvordan bekrefte avtalen skriftlig og planlegge fremtidige samtaler.
   - Neste steg dersom ønsket lønn ikke blir innvilget nå.

6. **Dos and Don'ts**
   - En oversikt over beste praksis og vanlige fallgruver i norske lønnsforhandlinger.

${PLAYBOOK_EXAMPLE}`
