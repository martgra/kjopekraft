/**
 * Occupation Mapper
 * Maps free-text job titles to SSB occupation codes using keyword matching
 * Returns confidence scores and approximate match indicators
 */

type OccupationMatch = {
  code: string
  label: string
  labelEn: string
  confidence: number
  isApproximate: boolean
}

/**
 * Registry of SSB occupation codes with keyword patterns
 * Each entry includes Norwegian and English keywords for matching
 */
const OCCUPATION_REGISTRY = {
  '2223': {
    label: 'Sykepleiere',
    labelEn: 'Nurses',
    keywords: {
      no: ['sykepleier', 'nurse', 'helsesøster', 'bedriftssykepleier'],
      en: ['nurse', 'rn', 'registered nurse', 'staff nurse'],
    },
    category: 'health',
  },
  '2512': {
    label: 'Programvareutviklere',
    labelEn: 'Software Developers',
    keywords: {
      no: [
        'utvikler',
        'programmerer',
        'software',
        'koder',
        'developer',
        'backend',
        'frontend',
        'fullstack',
        'systemutvikler',
      ],
      en: [
        'developer',
        'programmer',
        'software engineer',
        'coder',
        'backend developer',
        'frontend developer',
        'fullstack',
        'software developer',
      ],
    },
    category: 'tech',
  },
  '2330': {
    label: 'Lærere',
    labelEn: 'Teachers',
    keywords: {
      no: ['lærer', 'teacher', 'adjunkt', 'lektor', 'skolelærer', 'faglærer'],
      en: ['teacher', 'educator', 'instructor', 'school teacher'],
    },
    category: 'education',
  },
  '2146': {
    label: 'Ingeniører (bygg og anlegg)',
    labelEn: 'Civil Engineers',
    keywords: {
      no: ['ingeniør', 'sivilingeniør', 'bygningsingeniør', 'anleggsingeniør'],
      en: ['engineer', 'civil engineer', 'construction engineer'],
    },
    category: 'engineering',
  },
} as const

type OccupationCode = keyof typeof OCCUPATION_REGISTRY

/**
 * Normalize text for matching: lowercase, trim, remove special chars
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-zæøå0-9\s]/gi, '')
}

/**
 * Calculate match score for a job title against an occupation's keywords
 * Returns score 0-1 based on keyword matches
 */
function calculateMatchScore(jobTitle: string, keywords: string[]): number {
  const normalized = normalizeText(jobTitle)
  const words = normalized.split(/\s+/)

  let bestScore = 0

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword)

    // Exact match on full title
    if (normalized === normalizedKeyword) {
      return 1.0
    }

    // Exact word match
    if (words.includes(normalizedKeyword)) {
      bestScore = Math.max(bestScore, 0.9)
      continue
    }

    // Partial match (keyword contains word or vice versa)
    for (const word of words) {
      if (word.length >= 4 && normalizedKeyword.includes(word)) {
        bestScore = Math.max(bestScore, 0.7)
      } else if (word.length >= 4 && word.includes(normalizedKeyword)) {
        bestScore = Math.max(bestScore, 0.7)
      }
    }

    // Fuzzy match (keyword starts with word or vice versa)
    for (const word of words) {
      if (word.length >= 3 && normalizedKeyword.startsWith(word)) {
        bestScore = Math.max(bestScore, 0.6)
      } else if (word.length >= 3 && word.startsWith(normalizedKeyword)) {
        bestScore = Math.max(bestScore, 0.6)
      }
    }
  }

  return bestScore
}

/**
 * Map a free-text job title to an SSB occupation code
 * Returns best match with confidence score, or null if no reasonable match found
 */
export function mapJobTitleToOccupation(jobTitle: string): OccupationMatch | null {
  if (!jobTitle || jobTitle.trim().length === 0) {
    return null
  }

  const matches: Array<{ code: OccupationCode; score: number }> = []

  // Calculate match score for each occupation
  for (const [code, occupation] of Object.entries(OCCUPATION_REGISTRY)) {
    const allKeywords = [...occupation.keywords.no, ...occupation.keywords.en]
    const score = calculateMatchScore(jobTitle, allKeywords)

    if (score > 0) {
      matches.push({ code: code as OccupationCode, score })
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score)

  // Get best match
  const bestMatch = matches[0]

  // Threshold: reject matches below 0.5 confidence
  if (!bestMatch || bestMatch.score < 0.5) {
    return null
  }

  const occupation = OCCUPATION_REGISTRY[bestMatch.code]

  return {
    code: bestMatch.code,
    label: occupation.label,
    labelEn: occupation.labelEn,
    confidence: Math.round(bestMatch.score * 100) / 100, // 2 decimals
    isApproximate: bestMatch.score < 1.0,
  }
}

/**
 * Get occupation details by code (for direct lookups)
 */
export function getOccupationByCode(code: string): OccupationMatch | null {
  const occupation = OCCUPATION_REGISTRY[code as OccupationCode]

  if (!occupation) {
    return null
  }

  return {
    code,
    label: occupation.label,
    labelEn: occupation.labelEn,
    confidence: 1.0,
    isApproximate: false,
  }
}
