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
import { attachRequestId, getRequestId } from '@/lib/api/requestId'
import { logServiceError } from '@/lib/logger'

const fuse = createOccupationFuse(SSB_OCCUPATION_DOCS)

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req)
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 8)

  if (!q) {
    return attachRequestId(NextResponse.json({ results: [] }), requestId)
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
        return attachRequestId(
          NextResponse.json({ results: fallback, fallback: true, creditsExhausted: true }),
          requestId,
        )
      }
      spentCredits = true
    }

    return attachRequestId(
      NextResponse.json({ results: search.results, creditsExhausted, spentCredits }),
      requestId,
    )
  } catch (error) {
    logServiceError('ssbOccupationsRoute', error, { q, limit, requestId })
    const fallback = searchSsbOccupations(fuse, q, limit).map(r => ({
      code: r.code,
      label: r.label,
      fuseScore: r.score,
      finalScore: 1 - (r.score ?? 1),
    }))
    return attachRequestId(NextResponse.json({ results: fallback, fallback: true }), requestId)
  }
}
