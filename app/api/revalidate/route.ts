import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { attachRequestId, getRequestId } from '@/lib/api/requestId'

const ALLOWED_TAGS = new Set(['inflation', 'ssb-salary', 'storting-salary'])

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request)
  const token = request.headers.get('x-revalidate-token')
  if (!token || token !== process.env.REVALIDATE_SECRET) {
    return attachRequestId(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), requestId)
  }

  const { tag } = (await request.json()) as { tag?: string }
  if (!tag || !ALLOWED_TAGS.has(tag)) {
    return attachRequestId(NextResponse.json({ error: 'Invalid tag' }, { status: 400 }), requestId)
  }

  // next/cache revalidateTag expects (tag, type)
  await revalidateTag(tag, 'layout')
  return attachRequestId(NextResponse.json({ revalidated: true, tag }), requestId)
}
