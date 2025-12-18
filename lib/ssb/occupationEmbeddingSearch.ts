import { embed } from 'ai'
import { openai } from '@ai-sdk/openai'
import embeddingData from './occupations.embeddings.json'
import { SSB_OCCUPATION_DOCS, createOccupationFuse, searchSsbOccupations } from './occupationSearch'

type EmbeddedOccupation = {
  code: string
  label: string
  text: string
  embedding: number[] // normalized to unit length
}

type EmbeddingFile = {
  dim: number
  items: EmbeddedOccupation[]
}

export type EmbeddingResult = {
  code: string
  label: string
  score: number // cosine similarity (0..1)
}

const EMBEDDINGS = embeddingData as EmbeddingFile
const fuse = createOccupationFuse(SSB_OCCUPATION_DOCS)

// Small in-memory LRU cache for query embeddings to avoid repeat OpenAI calls
const MAX_CACHE = 100
const queryEmbeddingCache = new Map<string, number[]>()

function dot(a: number[], b: number[]) {
  let s = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const av = a[i]
    const bv = b[i]
    if (av !== undefined && bv !== undefined) {
      s += av * bv
    }
  }
  return s
}

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
  if (!norm) return vec
  return vec.map(v => v / norm)
}

async function embedQueryOpenAI(query: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for embedding search.')

  const model = process.env.OPENAI_EMBED_MODEL ?? 'openai/text-embedding-3-small'
  const { embedding } = await embed({
    model,
    value: query,
    providerOptions: {
      openai: { apiKey },
    },
  })

  return normalize(embedding)
}

async function getCachedQueryEmbedding(query: string): Promise<number[]> {
  const key = query.trim().toLowerCase()
  const cached = queryEmbeddingCache.get(key)
  if (cached) {
    // Refresh LRU position
    queryEmbeddingCache.delete(key)
    queryEmbeddingCache.set(key, cached)
    return cached
  }

  const vec = await embedQueryOpenAI(query)
  queryEmbeddingCache.set(key, vec)
  if (queryEmbeddingCache.size > MAX_CACHE) {
    const oldestKey = queryEmbeddingCache.keys().next().value as string | undefined
    if (oldestKey) queryEmbeddingCache.delete(oldestKey)
  }
  return vec
}

export async function searchOccupationsByEmbedding(
  query: string,
  limit = 8,
): Promise<EmbeddingResult[]> {
  if (!query.trim()) return []
  if (!EMBEDDINGS.items.length || !EMBEDDINGS.dim) return []

  const qVec = await getCachedQueryEmbedding(query)
  if (qVec.length !== EMBEDDINGS.dim) {
    throw new Error(`Query dim ${qVec.length} != db dim ${EMBEDDINGS.dim}`)
  }

  const scored = EMBEDDINGS.items.map(item => ({
    code: item.code,
    label: item.label,
    score: dot(qVec, item.embedding), // embeddings are normalized
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit)
}

export type HybridResult = {
  code: string
  label: string
  fuseScore?: number // lower is better in Fuse
  embeddingScore?: number // 0..1
  finalScore: number // higher is better
}

export async function hybridOccupationSearch(query: string, limit = 8): Promise<HybridResult[]> {
  if (!query.trim()) return []

  // 1) Get Fuse results (precision on code/label)
  const fuseResults = searchSsbOccupations(fuse, query, Math.max(limit, 20)).map(r => ({
    code: r.code,
    label: r.label,
    fuseScore: r.score,
  }))

  // 2) Get embedding results (semantic recall) with graceful fallback
  let embeddingResults: EmbeddingResult[] = []
  try {
    embeddingResults = await searchOccupationsByEmbedding(query, Math.max(limit, 20))
  } catch (error) {
    console.warn('Embedding search failed, falling back to Fuse only:', error)
  }

  // 3) Merge by code
  const merged = new Map<string, HybridResult>()

  for (const r of fuseResults) {
    merged.set(r.code, {
      code: r.code,
      label: r.label,
      fuseScore: r.fuseScore,
      finalScore: 0,
    })
  }

  for (const r of embeddingResults) {
    const existing = merged.get(r.code)
    if (existing) {
      merged.set(r.code, { ...existing, embeddingScore: r.score })
    } else {
      merged.set(r.code, {
        code: r.code,
        label: r.label,
        embeddingScore: r.score,
        finalScore: 0,
      })
    }
  }

  // 4) Rerank: prefer low Fuse score and high embedding score
  const scored: HybridResult[] = []
  for (const item of merged.values()) {
    const fuseComponent =
      item.fuseScore !== undefined ? 1 - Math.min(Math.max(item.fuseScore, 0), 1) : 0
    const embeddingComponent =
      item.embeddingScore !== undefined ? Math.min(Math.max(item.embeddingScore, 0), 1) : 0
    const finalScore = 0.6 * fuseComponent + 0.4 * embeddingComponent
    scored.push({ ...item, finalScore })
  }

  scored.sort((a, b) => b.finalScore - a.finalScore)
  return scored.slice(0, limit)
}
