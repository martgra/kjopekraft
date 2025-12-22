import { NextResponse } from 'next/server'
import { TEXT } from '@/lib/constants/text'
import { getServerSession } from './getSession'

export async function requireLogin(req: Request) {
  const session = await getServerSession(req.headers)
  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ error: TEXT.auth.loginRequired }, { status: 401 }),
    }
  }

  return { session, response: null }
}
