import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from '@/services/auth/getSession'
import { updateUserTimezone } from '@/services/users/userProfileService'

const payloadSchema = z.object({
  timezone: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await getServerSession(req.headers)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = payloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const updated = await updateUserTimezone(session.user.id, parsed.data.timezone)
    if (!updated) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, profile: updated })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update timezone',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
