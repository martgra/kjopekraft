import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from '@/services/auth/getSession'
import { updateUserTimezone } from '@/services/users/userProfileService'
import { attachRequestId, getRequestId } from '@/lib/api/requestId'
import { errorResponse } from '@/lib/api/errors'

const payloadSchema = z.object({
  timezone: z.string().min(1),
})

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  const session = await getServerSession(req.headers)
  if (!session) {
    return attachRequestId(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), requestId)
  }

  try {
    const body = await req.json()
    const parsed = payloadSchema.safeParse(body)
    if (!parsed.success) {
      return attachRequestId(
        NextResponse.json({ error: 'Invalid payload' }, { status: 400 }),
        requestId,
      )
    }

    const updated = await updateUserTimezone(session.user.id, parsed.data.timezone)
    if (!updated) {
      return attachRequestId(
        NextResponse.json({ error: 'Profile not found' }, { status: 404 }),
        requestId,
      )
    }

    return attachRequestId(NextResponse.json({ ok: true, profile: updated }), requestId)
  } catch (error) {
    return errorResponse(
      'userTimezoneRoute',
      error,
      { error: 'Failed to update timezone' },
      500,
      {},
      requestId,
    )
  }
}
