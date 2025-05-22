// promptBuilders.ts
import { NegotiationPoint, NegotiationUserInfo } from '@/lib/models/types'
import { EMAIL_EXAMPLE, PLAYBOOK_EXAMPLE } from '@/lib/examples'

export function buildEmailPrompt(
  points: NegotiationPoint[],
  userInfo?: NegotiationUserInfo,
): string {
  let userSection = ''
  if (userInfo) {
    userSection =
      `\n\nBakgrunnsinfo fra bruker:\n` +
      `- Stillingstittel: ${userInfo.jobTitle || 'Ikke oppgitt'}\n` +
      `- Bransje: ${userInfo.industry || 'Ikke oppgitt'}\n` +
      `- Ny jobb eller justering: ${userInfo.isNewJob === null ? 'Ikke oppgitt' : userInfo.isNewJob ? 'Ny jobb' : 'Justering'}\n` +
      `- Nåværende lønn: ${userInfo.currentSalary || 'Ikke oppgitt'}\n` +
      `- Ønsket lønn: ${userInfo.desiredSalary || 'Ikke oppgitt'}\n` +
      `- Prestasjoner: ${userInfo.achievements || 'Ikke oppgitt'}\n` +
      `- Markedsdata: ${userInfo.marketData || 'Ikke oppgitt'}\n` +
      `- Andre goder: ${userInfo.otherBenefits || 'Ikke oppgitt'}\n`
  }
  return `Skriv en profesjonell, høflig og kulturtilpasset e-post på norsk til lønnsforhandling basert på følgende punkter:
 Formatter pent med linjeskift, innrykk kulepunkter. 

${points.map(p => `- ${p.description} (${p.type})`).join('\n')}${userSection}`
}

export function buildPlaybookPrompt(
  points: NegotiationPoint[],
  userInfo?: NegotiationUserInfo,
): string {
  let userSection = ''
  if (userInfo) {
    userSection =
      `\n\nBakgrunnsinfo fra bruker:\n` +
      `- Stillingstittel: ${userInfo.jobTitle || 'Ikke oppgitt'}\n` +
      `- Bransje: ${userInfo.industry || 'Ikke oppgitt'}\n` +
      `- Ny jobb eller justering: ${userInfo.isNewJob === null ? 'Ikke oppgitt' : userInfo.isNewJob ? 'Ny jobb' : 'Justering'}\n` +
      `- Nåværende lønn: ${userInfo.currentSalary || 'Ikke oppgitt'}\n` +
      `- Ønsket lønn: ${userInfo.desiredSalary || 'Ikke oppgitt'}\n` +
      `- Prestasjoner: ${userInfo.achievements || 'Ikke oppgitt'}\n` +
      `- Markedsdata: ${userInfo.marketData || 'Ikke oppgitt'}\n` +
      `- Andre goder: ${userInfo.otherBenefits || 'Ikke oppgitt'}\n`
  }
  return `Lag en profesjonell, detaljert og kulturtilpasset forhandlingsplan (playbook) på norsk basert på følgende punkter:
${points.map(p => `- ${p.description} (${p.type})`).join('\n')}${userSection}

Svar med en komplett playbook i samme stil.`
}

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

${EMAIL_EXAMPLE}

Svar med en komplett e-post i samme stil.
`

export const SYSTEM_PROMPT_PLAYBOOK = `
Din rolle er å lage en playbook som en bruker kan ta med seg inn i lønnsforhandlinger. 

Playbooken skal være et konkret trinn-for-trinn-verktøy som aktivt bruker eksempler fra brukers erfaringer, ansvarsområder, resultater og eventuelle markedsdata denne har oppgitt.
Formatter pent med linjeskift, innrykk kulepunkter. 

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
