import { NextResponse } from 'next/server'
import { DEFAULT_CREDIT_COSTS } from '@/domain/credits'
import { getDailyCreditsForUser } from '@/services/credits/creditsService'
import { requireLogin } from '@/services/auth/requireLogin'
import { getUserProfile } from '@/services/users/userProfileService'
import { attachRequestId, getRequestId } from '@/lib/api/requestId'

export async function GET(req: Request) {
  const requestId = getRequestId(req)
  const { session, response } = await requireLogin(req)
  if (response) return attachRequestId(response, requestId)

  const userId = session?.user?.id
  if (!userId) {
    return attachRequestId(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), requestId)
  }

  const profile = await getUserProfile(userId)
  const timezone = profile?.timezone ?? 'UTC'

  const snapshot = await getDailyCreditsForUser(userId, timezone)
  return attachRequestId(
    NextResponse.json({
      dateKey: snapshot.credits.dateKey,
      credits: {
        used: snapshot.credits.used,
        limit: snapshot.credits.limit,
        remaining: snapshot.remaining,
      },
      costs: DEFAULT_CREDIT_COSTS,
    }),
    requestId,
  )
}
