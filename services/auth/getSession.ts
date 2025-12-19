import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export type ServerSession = typeof auth.$Infer.Session

export async function getServerSession(reqHeaders?: Headers): Promise<ServerSession | null> {
  const resolvedHeaders = reqHeaders ?? (await headers())
  return auth.api.getSession({ headers: resolvedHeaders })
}
