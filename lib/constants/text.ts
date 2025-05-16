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
  },

  stats: {
    startingSalary: 'Startlønn',
    currentSalary: 'Nåværende lønn',
    inflationAdjusted: 'Inflasjons-justert',
    gap: 'Gap (%)',
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
    noDataMessage:
      'Kunne ikke laste inflasjonsdata fra SSB API. Bruker forhåndsdefinerte verdier.',
    latestData:
      'Siste år: {year} med inflasjon på {inflation}% 🔥',
    showAllYears: 'Vis alle år ({count})',
    yearHeader: 'År',
    inflationHeader: 'Inflasjon (%)',
  },

  footer: {
    reportIssue: 'Rapporter problemer',
    license: 'Apache 2.0 lisens',
  },
};
