import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'

// Valid cache tags that can be revalidated
const VALID_TAGS = ['inflation', 'ssb-salary'] as const
type ValidTag = (typeof VALID_TAGS)[number]

const RevalidateRequestSchema = z.object({
  tag: z.enum(VALID_TAGS),
})

/**
 * POST /api/revalidate
 * On-demand cache revalidation endpoint
 *
 * Requires x-revalidate-token header matching REVALIDATE_SECRET env var
 *
 * Body: { tag: 'inflation' | 'ssb-salary' }
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token')
  const secret = process.env['REVALIDATE_SECRET']

  // Check authentication
  if (!secret) {
    logger.warn('Revalidation attempted but REVALIDATE_SECRET not configured', {
      component: 'revalidate-api',
    })
    return NextResponse.json({ error: 'Revalidation not configured' }, { status: 503 })
  }

  if (token !== secret) {
    logger.warn('Unauthorized revalidation attempt', {
      component: 'revalidate-api',
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parseResult = RevalidateRequestSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'Invalid request',
        details: parseResult.error.flatten(),
        validTags: VALID_TAGS,
      },
      { status: 400 },
    )
  }

  const { tag } = parseResult.data

  // Perform revalidation using Next.js 16 revalidateTag with 'max' profile
  // This immediately invalidates the cache for the given tag
  try {
    revalidateTag(tag, 'max')
    logger.info(`Cache revalidated for tag: ${tag}`, {
      component: 'revalidate-api',
      action: 'revalidate',
      tag,
    })

    return NextResponse.json({
      revalidated: true,
      tag,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Revalidation failed', error, {
      component: 'revalidate-api',
      tag,
    })
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}

/**
 * GET /api/revalidate
 * Returns available tags (for documentation)
 */
export async function GET() {
  return NextResponse.json({
    availableTags: VALID_TAGS,
    usage: {
      method: 'POST',
      headers: { 'x-revalidate-token': 'your-secret-token' },
      body: { tag: 'inflation | ssb-salary' },
    },
  })
}
