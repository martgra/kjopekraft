import { NextRequest, NextResponse } from 'next/server'
import { hybridOccupationSearch } from '@/lib/ssb/occupationEmbeddingSearch'
import {
  createOccupationFuse,
  searchSsbOccupations,
  SSB_OCCUPATION_DOCS,
} from '@/lib/ssb/occupationSearch'

const fuse = createOccupationFuse(SSB_OCCUPATION_DOCS)

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 8)

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  try {
    const results = await hybridOccupationSearch(q, limit)
    return NextResponse.json({ results })
  } catch (error) {
    console.warn('Occupation search fallback (Fuse only):', error)
    const fallback = searchSsbOccupations(fuse, q, limit).map(r => ({
      code: r.code,
      label: r.label,
      fuseScore: r.score,
      finalScore: 1 - (r.score ?? 1),
    }))
    return NextResponse.json({ results: fallback, fallback: true })
  }
}
