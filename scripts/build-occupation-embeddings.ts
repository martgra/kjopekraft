/**
 * Build occupation embedding file for SSB codes.
 *
 * Usage:
 *   OPENAI_API_KEY=... bunx tsx scripts/build-occupation-embeddings.ts
 *
 * Output:
 *   lib/ssb/occupations.embeddings.json
 *
 * The script uses OpenAI's text-embedding-3-small model via fetch
 * (no extra dependency). Vectors are normalized to unit length.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import dotenv from 'dotenv'
import { embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'
import { SSB_OCCUPATION_MAP } from '../lib/ssb/occupationSearch'

type EmbeddedOccupation = {
  code: string
  label: string
  text: string
  embedding: number[]
}

// Load env (supports .env and .env.local)
dotenv.config()
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
const MODEL = process.env.OPENAI_EMBED_MODEL ?? 'openai/text-embedding-3-small'
const BATCH_SIZE = 64

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required to build occupation embeddings.')
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: MODEL,
    values: texts,
    providerOptions: {
      openai: { apiKey: OPENAI_API_KEY },
    },
  })
  return embeddings.map(vec => normalize(vec))
}

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0))
  if (!norm) return vec
  return vec.map(v => v / norm)
}

// Keep text tight: label is usually enough for 11418 codes
function buildEmbeddingText(label: string): string {
  return label
}

async function main() {
  const rows = Object.entries(SSB_OCCUPATION_MAP).map(([code, label]) => ({
    code,
    label,
    text: buildEmbeddingText(label),
  }))

  const out: EmbeddedOccupation[] = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const vectors = await embedTexts(batch.map(r => r.text))

    if (vectors.length !== batch.length) {
      throw new Error(`Embedding count mismatch: got ${vectors.length}, expected ${batch.length}`)
    }

    for (let j = 0; j < batch.length; j++) {
      const row = batch[j]
      const vector = vectors[j]
      if (!row || !vector) continue
      out.push({
        code: row.code,
        label: row.label,
        text: row.text,
        embedding: vector,
      })
    }
    console.log(`Embedded ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`)
  }

  const dim = out[0]?.embedding.length ?? 0
  if (!dim) throw new Error('No embeddings produced')
  if (out.some(r => r.embedding.length !== dim)) {
    throw new Error('Inconsistent embedding dimensions detected')
  }

  const dest = path.join(process.cwd(), 'lib', 'ssb', 'occupations.embeddings.json')
  await fs.writeFile(dest, JSON.stringify({ dim, items: out }, null, 2), 'utf8')
  console.log(`Wrote ${out.length} embeddings to ${dest} (dim=${dim})`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
