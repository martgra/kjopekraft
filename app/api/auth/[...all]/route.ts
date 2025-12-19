import { toNextJsHandler } from 'better-auth/next-js'
import { getAuth } from '@/lib/auth'

function getHandlers() {
  return toNextJsHandler(getAuth())
}

export async function GET(req: Request) {
  return getHandlers().GET(req)
}

export async function POST(req: Request) {
  return getHandlers().POST(req)
}
