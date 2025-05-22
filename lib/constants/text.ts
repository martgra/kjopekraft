export const TEXT = {
  common: {
    loading: '⏳ Laster...',
    loadingData: '⏳ Henter data…',
    loadingChart: '⏳ Bygger graf…',
    error: '🚨 Oops! Noe gikk galt.',
    noData: '— Ingen data tilgjengelig',
    save: '💾 Lagre',
    cancel: '❌ Avbryt',
    edit: '✏️ Endre',
    remove: '🗑️ Fjern',
    add: '➕ Legg til',
    year: 'År',
    currency: 'NOK',
    reset: '🔄 Tilbakestill',
    confirmReset: '⚠️ Er du sikker på at du vil tilbakestille alle lønnspunkter?',
    perYear: 'per år',
    lastTabPersistence: 'Du vil bli returnert til siste fanen du brukte ved neste besøk.',
  },

  dashboard: {
    title: 'Har kjøpekraften din økt? 💸💸',
    noData: 'Legg til minst 2 lønnspunkter ➕ for å se grafen.',
    addPointsTitle: '➕ Legg til lønnspunkter',
  },

  charts: {
    payDevelopmentTitle: '📊 Lønnsutvikling vs. Inflasjon',
    xAxisLabel: 'År',
    yAxisLabel: 'Lønn (NOK)',
    actualPayLabel: 'Faktisk lønn',
    inflationAdjustedLabel: 'Inflasjons-justert',
    yearPrefix: 'År: ',
    notAvailable: '—',
    minPointsRequired: 'Legg til minst to lønnspunkter for å vise graf.',
    // **New** toggle button labels:
    showGross: 'Vis bruttolønn',
    showNet: 'Vis nettolønn',
    tabGuide:
      'Se hvordan lønnen din har utviklet seg sammenlignet med inflasjonen. Bruk denne grafen for å forstå din kjøpekraft over tid og forberede deg til lønnsforhandlinger.',
  },

  stats: {
    // Renamed to match your props:
    startingPay: 'Startlønn',
    latestPay: 'Nåværende lønn',
    inflationAdjustedPay: 'Inflasjons-justert',
    gapPercent: 'Gap (%)',
  },

  forms: {
    yearLabel: 'År 📅',
    payLabel: 'Lønn (NOK) 💰',
    yearPlaceholder: 'f.eks. 2023',
    payPlaceholder: 'f.eks. 550 000',
    addPointButton: '➕ Legg til punkt',
    yourPoints: 'Dine lønnspunkter',
    noPointsMessage:
      'Ingen lønnspunkter lagt til ennå. Bruk skjemaet nedenfor for å komme i gang! 🚀',
    saveButton: '✅ Lagre',
    addButtonDisabledTitle: 'Fyll ut gyldige verdier før du legger til',
    addButtonTitle: 'Legg til nytt lønnspunkt',
    tabGuide:
      'Legg inn lønnspunktene dine for å få en oversikt over lønnsutviklingen. Jo flere punkter, jo bedre analyse får du!',
    validation: {
      yearRange: 'År må være mellom {min} og {max}',
      payPositive: 'Lønn må være større enn 0',
      required: 'Fyll ut alle felter',
      yearExists: 'Dette året er allerede lagt til',
    },
  },

  inflation: {
    title: '📈 Inflasjonsdata fra SSB',
    noDataTitle: 'Ingen inflasjonsdata',
    noDataMessage: 'Kunne ikke laste inflasjonsdata fra SSB API. Bruker forhåndsdefinerte verdier.',
    latestData: 'Siste år: {year} med inflasjon på {inflation}% 🔥',
    showAllYears: 'Vis alle år ({count})',
    yearHeader: 'År',
    inflationHeader: 'Inflasjon (%)',
  },

  footer: {
    reportIssue: 'Rapporter problemer',
    license: 'Apache 2.0 lisens',
  },

  negotiation: {
    guide:
      'Legg inn dine viktigste argumenter for lønnsforhandling. Skriv fritt og bruk flere punkter – dette hjelper deg å forberede en god forhandlingsstrategi! Du kan også generere en e-post eller et forhandlings-playbook basert på punktene dine.',
    descriptionPlaceholder: 'Beskriv et argument, prestasjon eller markedssituasjon',
    typePlaceholder: 'Velg type',
    typeAchievement: 'Prestasjon',
    typeMarket: 'Marked',
    typeResponsibility: 'Ansvar',
    typeCertification: 'Sertifisering',
    addButton: 'Legg til',
    generateEmail: 'Generer e-post',
    generatePlaybook: 'Generer playbook',
    generatingEmail: 'Genererer e-post...',
    generatingPlaybook: 'Genererer playbook...',
    tabGuide:
      'Legg inn dine viktigste argumenter og generer e-post eller playbook for forhandling. Dette hjelper deg å være best mulig forberedt!',
    minPointsWarning: 'Legg til minst ett forhandlingspunkt før du genererer innhold.',
    maxGenerationsWarning: 'Du har nådd maks antall genereringer.',
    copyMarkdown: 'Kopier markdown',
    copyMarkdownSuccess: 'Markdown kopiert!',
    copyMarkdownError: 'Kunne ikke kopiere markdown',
    copyRich: 'Kopier som rik tekst',
    copyRichSuccess: 'Rik tekst kopiert!',
    copyRichError: 'Kunne ikke kopiere rik tekst',
    downloadDocx: 'Last ned som DOCX',
    collapseEmail: 'Vis/skjul e-post',
    collapsePlaybook: 'Vis/skjul spillbok',
    emailSectionTitle: 'Forslag til e-post',
    playbookSectionTitle: 'Spillbok',
    copyPrompt: 'Kopier prompt',
  },
}
