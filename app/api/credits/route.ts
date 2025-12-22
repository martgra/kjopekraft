import { NextResponse } from 'next/server'
import { DEFAULT_CREDIT_COSTS } from '@/domain/credits'
import { getDailyCreditsForUser } from '@/services/credits/creditsService'
import { requireLogin } from '@/services/auth/requireLogin'
import { getUserProfile } from '@/services/users/userProfileService'

export async function GET(req: Request) {
  const { session, response } = await requireLogin(req)
  if (response) return response

  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await getUserProfile(userId)
  const timezone = profile?.timezone ?? 'UTC'

  const snapshot = await getDailyCreditsForUser(userId, timezone)
  return NextResponse.json({
    dateKey: snapshot.credits.dateKey,
    credits: {
      used: snapshot.credits.used,
      limit: snapshot.credits.limit,
      remaining: snapshot.remaining,
    },
    costs: DEFAULT_CREDIT_COSTS,
  })
}
