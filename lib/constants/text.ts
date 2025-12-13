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
    confirmDelete: '⚠️ Er du sikker på at du vil slette dette lønnspunktet?',
    perYear: 'per år',
    lastTabPersistence: 'Du vil bli returnert til siste fanen du brukte ved neste besøk.',
    pts: 'kr',
    close: 'Lukk',
  },

  // Mobile drawer
  drawer: {
    openDrawer: 'Åpne datapanel',
    closeDrawer: 'Lukk datapanel',
    dashboardTitle: 'Legg til lønnspunkt',
    negotiationTitle: 'Argumenter',
  },

  // Sidebar navigation
  sidebar: {
    brandName: 'Kjøpekraft',
    planLabel: '',
    navDashboard: 'Oversikt',
    navNegotiation: 'Forhandling',
    navHistory: 'Historikk',
    navReports: 'Rapporter',
    navSettings: 'Innstillinger',
    comingSoon: 'Kommer snart',
  },

  dashboard: {
    title: 'Har kjøpekraften din økt? 💸💸',
    noData: 'Legg til minst 2 lønnspunkter ➕ for å se grafen.',
    addPointsTitle: '➕ Legg til lønnspunkter',
    // New dashboard header text
    annualOverview: 'Lønnsoversikt',
    annualOverviewSubtitle: 'Følg din lønnsutvikling over tid sammenlignet med inflasjon',
    fiscalYear: '{year}',
    addDataPrompt: 'Legg til lønnsdata for å se metrikker og grafer',
    noDataTitle: 'Ingen data å vise ennå',
    noDataSubtitle: 'Legg til lønnspunkter ved hjelp av skjemaet for å se vekstgrafen din',
    showNetSalary: 'Vis nettolønn (etter skatt)',
    showDataEntry: 'Legg til lønnspunkt',
    hideDataEntry: 'Skjul datapanel',
  },

  charts: {
    payDevelopmentTitle: '📊 Lønnsutvikling vs. Inflasjon',
    xAxisLabel: 'År',
    yAxisLabel: 'Lønn (NOK)',
    actualPayLabel: 'Faktisk lønn',
    inflationAdjustedLabel: 'Inflasjons-justert',
    inflationLabel: 'Inflasjon',
    yearPrefix: 'År: ',
    notAvailable: '—',
    minPointsRequired: 'Legg til minst to lønnspunkter for å vise graf.',
    showGross: 'Bruttolønn',
    showNet: 'Nettolønn',
    tabGuide:
      'Se hvordan lønnen din har utviklet seg sammenlignet med inflasjonen. Bruk denne grafen for å forstå din kjøpekraft over tid og forberede deg til lønnsforhandlinger.',
    // ChartSection header
    chartTitle: 'Årlig lønnsvekst vs. Inflasjon',
    chartSubtitle: 'Følg dine årlige lønnspunkter mot reell kjøpekraft.',
    // Mode toggle
    modeBadgeGross: 'BRUTTO',
    modeBadgeNet: 'NETTO',
    modeToggleLabel: 'Vis nettolønn (etter skatt)',
    controlsLabel: 'Visningsalternativer',
    // Reference occupation
    compareWithOccupation: 'Sammenlign med yrke:',
    legendGross: 'Bruttolønn',
    legendInflationAdjusted: 'Inflasjons-justert',
    legendReference: 'Referanse',
    // Reference salary dropdown
    averageLabel: 'Gj.snitt',
    noReference: 'Ingen referanse',
  },

  views: {
    switcherLabel: 'Visning',
    graphLabel: 'Graf',
    tableLabel: 'Tabell',
    analysisLabel: 'Analyse',
    graphDescription: 'Visualiser lønnen din mot inflasjon.',
    tableDescription: 'Se tallene med årlige endringer og referansegap.',
    analysisDescription: 'Høydepunkter fra lønnshistorikken din.',
    table: {
      columns: {
        year: 'År',
        salary: 'Lønn (brutto)',
        netSalary: 'Lønn (netto)',
        inflationAdjusted: 'Inflasjons-justert',
        yoyChange: 'Endring vs i fjor',
        powerDelta: 'Kjøpekraft vs inflasjon',
        referenceGap: 'Gap vs referanse',
      },
      interpolated: 'Estimert',
      badgeGain: 'Over inflasjon',
      badgeLoss: 'Under inflasjon',
    },
    analysis: {
      empty: 'Legg til flere lønnspunkter for å generere analyse.',
      largestRaiseTitle: 'Største lønnshopp',
      powerGainTitle: 'Beste kjøpekraft',
      powerLossTitle: 'Største fall i kjøpekraft',
      referenceWinsTitle: 'År over referanse',
      referenceLossesTitle: 'År under referanse',
      streakTitle: 'Streak over inflasjon',
      badgeRaise: 'Hopp',
      badgePower: 'Kraft',
      badgeHeadwind: 'Motvind',
      badgeAhead: 'Over',
      badgeBehind: 'Under',
      badgeStreak: 'Streak',
      yearsWon: 'år over referanse',
      yearsBehind: 'år under referanse',
      years: 'år',
    },
  },

  stats: {
    startingPay: 'Startlønn',
    latestPay: 'Nåværende lønn',
    inflationAdjustedPay: 'Inflasjons-justert',
    gapPercent: 'Gap (%)',
  },

  // Metrics grid
  metrics: {
    totalAnnualSalary: 'Total årslønn',
    totalAnnualNetSalary: 'Total årslønn (netto)',
    vsStart: 'vs start',
    realAnnualValue: 'Reell årsverdi (just.)',
    vsInflation: 'vs Inflasjon',
    yearlyChange: 'Årlig endring',
    thisYear: 'i år',
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
      invalidInput: 'Ugyldig input',
      inflationDataUnavailable:
        'Inflasjonsdata er kun tilgjengelig fra {minYear}. Vennligst velg et senere år.',
    },
    // SalaryPointForm specific
    logSalaryPoint: 'Logg lønnspunkt',
    grossAmount: 'Bruttobeløp',
    netAmount: 'Nettobeløp',
    yearRange: 'År ({min}-{max})',
    saveLog: 'Lagre logg',
    reasonLabel: 'Hvorfor økte lønnen?',
    reasonPlaceholder: 'Velg årsak',
    reasonHelp: 'Brukes til å analysere lønnslinjer etter type endring.',
    reasonOptions: {
      adjustment: 'Ordinær justering',
      promotion: 'Forfremmelse',
      newJob: 'Ny jobb',
    },
  },

  // Activity timeline
  activity: {
    recentActivity: 'Nylig aktivitet',
    noActivityYet: 'Ingen aktivitet ennå. Legg til ditt første lønnspunkt for å komme i gang!',
    salaryAdded: 'Lønn lagt til',
    thisYear: 'I år',
    lastYear: 'I fjor',
    yearsAgo: (years: number) => `${years} år siden`,
    reasons: {
      adjustment: 'Justering',
      promotion: 'Forfremmelse',
      newJob: 'Ny jobb',
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

  negotiationPage: {
    title: 'Lønnsforhandlings-assistent',
    subtitle: 'Generer personlige forhandlingsstrategier og e-poster drevet av AI.',
    backToDashboard: 'Tilbake til oversikt',
  },

  negotiationForm: {
    detailsTitle: 'Detaljer',
    contextTitle: 'Kontekst',
    jobTitleLabel: 'Stillingstittel',
    jobTitlePlaceholder: 'F.eks. Utvikler, Prosjektleder',
    industryLabel: 'Bransje',
    industryPlaceholder: 'F.eks. IT, Helse, Bygg',
    isNewJobLabel: 'Ny jobb?',
    selectPlaceholder: 'Velg',
    yesOption: 'Ja',
    noOption: 'Nei',
    currentSalaryLabel: 'Nåværende lønnsnivå',
    currentSalaryPlaceholder: 'F.eks. 650 000 kr',
    desiredSalaryLabel: 'Ønsket lønnsnivå',
    desiredSalaryPlaceholder: 'F.eks. 700 000 kr',
    marketDataLabel: 'Markedsdata/lønnsstatistikk',
    marketDataPlaceholder: 'F.eks. SSB: Medianlønn for din rolle, rapporter, etc.',
    otherBenefitsLabel: 'Betingelser/goder',
    otherBenefitsPlaceholder: 'F.eks. bonus, ekstra ferie, fleksibilitet',
    achievementsNote: 'Prestasjoner/resultater legges til som egne forhandlingspunkter nedenfor.',
  },

  negotiation: {
    sectionTitle: 'Forhandling',
    argumentBuilderTitle: 'Argumentbygger',
    showArguments: 'Vis argumenter',
    hideArguments: 'Skjul argumenter',
    guide:
      'Legg inn dine viktigste argumenter for lønnsforhandling. Skriv fritt og bruk flere punkter – dette hjelper deg å forberede en god forhandlingsstrategi! Du kan også generere en e-post eller et forhandlings-playbook basert på punktene dine.',
    descriptionPlaceholder: 'Beskriv et argument, prestasjon eller markedssituasjon',
    keyPointPlaceholder: 'Beskriv nøkkelpunktet ditt...',
    typePlaceholder: 'Velg type',
    typeAchievement: 'Prestasjon',
    typeExperience: 'Erfaring',
    typeMarket: 'Marked',
    typeResponsibility: 'Ansvar',
    typeCertification: 'Sertifisering',
    addButton: 'Legg til',
    addToList: 'Legg til i listen',
    emailButton: 'E-post',
    playbookButton: 'Spillbok',
    generating: 'Genererer...',
    remaining: 'igjen',
    generateEmail: 'Generer e-post',
    generatePlaybook: 'Generer spillbok',
    generatingEmail: 'Genererer e-post...',
    generatingPlaybook: 'Genererer spillbok...',
    tabGuide:
      'Legg inn dine viktigste argumenter og generer e-post eller spillbok for forhandling. Dette hjelper deg å være best mulig forberedt!',
    minPointsWarning: 'Legg til minst ett forhandlingspunkt før du genererer innhold.',
    suggestionMorePoints: 'Tips: Legg til flere punkter for bedre resultater (anbefalt: 3+)',
    addPointsHint: 'Legg til dine nøkkelpunkter ovenfor',
    maxGenerationsWarning: 'Du har nådd maks antall genereringer.',
    emailErrorTitle: 'Det oppstod en feil med e-post generering',
    playbookErrorTitle: 'Det oppstod en feil med spillbok generering',
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
    noPointsYet: 'Ingen punkter lagt til ennå',
    yourPoints: 'Dine forhandlingspunkter',
    removePoint: 'Fjern punkt',
    // SSB data notices for AI-generated content
    ssbDataNotices: {
      approximateMatch: 'Merk: Bruker nærmeste yrkeskategori ({occupation}) fra SSB',
      noDataAvailable: 'Kunne ikke finne relevant SSB-data for dette yrket',
      dataSourceCitation: 'Kilde: SSB Tabell 11418',
      usingEstimate: 'Bruker estimert data for {year}',
      occupationCodes: {
        '2223': 'Sykepleiere',
        '2512': 'Programvareutviklere',
        '2330': 'Lærere',
        '2146': 'Ingeniører (bygg og anlegg)',
      },
    },
  },

  onboarding: {
    welcomeTitle: 'Velkommen til Kjøpekraft',
    welcomeMessage:
      'Få innsikt i om lønnen din faktisk har blitt bedre, eller bare høyere. Sammenlign din lønnsutvikling mot inflasjonen for å forstå din reelle kjøpekraft.',
    loadDemoButton: 'Prøv med eksempeldata',
    addOwnDataButton: 'Legg til min egen lønn',
    whatIsKjopekraft: 'Hva er kjøpekraft?',
    kjopekraftExplanation:
      'Kjøpekraft viser hva lønnen din faktisk er verdt. Selv om lønnen din øker med 10%, kan inflasjonen spise opp mye av veksten. Vi viser deg forskjellen mellom nominell lønn (tall på kontoutskriften) og reell verdi (hva du faktisk kan kjøpe).',
    demoDataInfo:
      'Dette er eksempeldata. Legg til ditt første reelle lønnspunkt for å erstatte dem.',
    clearDemoData: 'Fjern eksempeldata',
  },

  help: {
    realAnnualValue:
      'Dette viser hva din startlønn ville vært verdt i dag, justert for inflasjon. Sammenligner kjøpekraften din nå mot da.',
    inflationAdjusted:
      'Viser hvordan lønnen din ville utviklet seg hvis den hadde fulgt inflasjonen fra starttidspunktet. Hjelper deg se om du har fått reell lønnsvekst.',
    yearlyChange:
      'Den prosentvise endringen i lønnen din fra start til nå, korrigert for inflasjon. Viser om kjøpekraften din har økt eller sunket.',
  },

  referenceSalary: {
    toggleLabel: 'Sammenlign med referanselønn',
    chartLabel: 'Referanse (Sykepleiere)',
    occupation: 'Sykepleiere',
    sourceLabel: 'Kilde: SSB',
    description: 'Median årslønn for sykepleiere (SSB)',
    enabledBadge: 'Referanse aktiv',
    helpText:
      'Sammenlign din lønnsutvikling med gjennomsnittslønn for sykepleiere i Norge basert på SSB data.',
    estimated: 'Estimert',
    official: 'Offisiell',
    estimatedNote: 'Estimert basert på SSB lønnsindeks',
  },
}
