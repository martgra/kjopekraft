import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { buildEmailPrompt, SYSTEM_PROMPT_EMAIL } from '@/lib/prompts'
import type { NegotiationEmailContext } from '@/domain/contracts'
import type { NegotiationPoint, NegotiationUserInfo } from '@/lib/schemas/negotiation'
import { requireLogin } from '@/services/auth/requireLogin'
import { checkAndSpendCredits } from '@/services/credits/creditsService'
import { getUserProfile } from '@/services/users/userProfileService'
import { TEXT } from '@/lib/constants/text'
import { errorResponse } from '@/lib/api/errors'
import { attachRequestId, getRequestId } from '@/lib/api/requestId'

export const maxDuration = 30 // Allow responses up to 30 seconds

export async function POST(req: Request) {
  const requestId = getRequestId(req)
  try {
    const { session, response } = await requireLogin(req)
    if (response) return attachRequestId(response, requestId)
    const userId = session?.user?.id
    if (!userId) {
      return attachRequestId(
        NextResponse.json({ error: TEXT.auth.loginRequired }, { status: 401 }),
        requestId,
      )
    }

    const profile = await getUserProfile(userId)
    const timezone = profile?.timezone ?? 'UTC'
    const creditCheck = await checkAndSpendCredits({
      userId,
      timezone,
      feature: 'email_generator',
    })
    if (!creditCheck.allowed) {
      return attachRequestId(
        NextResponse.json({ error: TEXT.credits.exhausted }, { status: 429 }),
        requestId,
      )
    }

    const { points, userInfo, context } = (await req.json()) as {
      points: NegotiationPoint[]
      userInfo: NegotiationUserInfo
      context?: NegotiationEmailContext
    }

    const prompt = buildEmailPrompt(points, userInfo, context)

    const { text } = await generateText({
      model: openai('gpt-5'),
      system: SYSTEM_PROMPT_EMAIL,
      prompt,
    })
    return attachRequestId(NextResponse.json({ result: text, prompt: prompt }), requestId)
  } catch (error) {
    return errorResponse(
      'emailGenerationRoute',
      error,
      { error: 'Failed to generate email' },
      500,
      {},
      requestId,
    )
  }
}
