import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

const ALLOWED_TAGS = new Set(['inflation', 'ssb-salary'])

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token')
  if (!token || token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tag } = (await request.json()) as { tag?: string }
  if (!tag || !ALLOWED_TAGS.has(tag)) {
    return NextResponse.json({ error: 'Invalid tag' }, { status: 400 })
  }

  // next/cache revalidateTag expects (tag, type)
  await revalidateTag(tag, 'layout')
  return NextResponse.json({ revalidated: true, tag })
}
