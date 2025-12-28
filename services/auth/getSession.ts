import { headers } from 'next/headers'
import { getAuth } from '@/lib/auth'

type ServerSession = ReturnType<typeof getAuth>['$Infer']['Session']

export async function getServerSession(reqHeaders?: Headers): Promise<ServerSession | null> {
  const resolvedHeaders = reqHeaders ?? (await headers())
  return getAuth().api.getSession({ headers: resolvedHeaders })
}
