import { NextRequest, NextResponse } from 'next/server'
import { hybridOccupationSearch } from '@/lib/ssb/occupationEmbeddingSearch'
import {
  createOccupationFuse,
  searchSsbOccupations,
  SSB_OCCUPATION_DOCS,
} from '@/lib/ssb/occupationSearch'
import { getServerSession } from '@/services/auth/getSession'
import { getDailyCreditsForUser, checkAndSpendCredits } from '@/services/credits/creditsService'
import { getUserProfile } from '@/services/users/userProfileService'

const fuse = createOccupationFuse(SSB_OCCUPATION_DOCS)

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 8)

  if (!q) {
    return NextResponse.json({ results: [] })
  }

  try {
    const session = await getServerSession(req.headers)
    const userId = session?.user?.id ?? null
    let timezone = 'UTC'
    let allowEmbedding = Boolean(userId)
    let creditsExhausted = false

    if (userId) {
      const profile = await getUserProfile(userId)
      timezone = profile?.timezone ?? 'UTC'
      const snapshot = await getDailyCreditsForUser(userId, timezone)
      if (snapshot.remaining <= 0) {
        allowEmbedding = false
        creditsExhausted = true
      }
    }

    const search = await hybridOccupationSearch(q, limit, {
      allowEmbedding,
      allowCachedEmbedding: true,
    })

    let spentCredits = false
    if (search.usedEmbedding && userId) {
      const spend = await checkAndSpendCredits({
        userId,
        timezone,
        feature: 'embedding_search',
      })
      if (!spend.allowed) {
        creditsExhausted = true
        const fallback = searchSsbOccupations(fuse, q, limit).map(r => ({
          code: r.code,
          label: r.label,
          fuseScore: r.score,
          finalScore: 1 - (r.score ?? 1),
        }))
        return NextResponse.json({ results: fallback, fallback: true, creditsExhausted: true })
      }
      spentCredits = true
    }

    return NextResponse.json({ results: search.results, creditsExhausted, spentCredits })
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
