import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { buildTextValidationPrompt, SYSTEM_PROMPT_TEXT_VALIDATION } from '@/lib/prompts'
import { AI_TEXT_COMPLETION_MODELS } from '@/lib/ai/models'
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
      feature: 'argument_improver',
    })
    if (!creditCheck.allowed) {
      return attachRequestId(
        NextResponse.json({ error: TEXT.credits.exhausted }, { status: 429 }),
        requestId,
      )
    }

    const { text, language, maxChars, systemPrompt, pointType, history, forceFinalize, model } =
      (await req.json()) as {
        text?: string
        language?: string
        maxChars?: number
        systemPrompt?: string
        pointType?: string
        history?: { role: 'assistant' | 'user'; content: string }[]
        forceFinalize?: boolean
        model?: string
      }

    if (!text || typeof text !== 'string') {
      return attachRequestId(
        NextResponse.json({ error: 'Missing text' }, { status: 400 }),
        requestId,
      )
    }

    if (typeof maxChars === 'number' && text.length > maxChars) {
      return attachRequestId(
        NextResponse.json({ error: 'Text too long' }, { status: 400 }),
        requestId,
      )
    }

    const askedCount =
      Array.isArray(history) && history.length
        ? history.filter(entry => entry.role === 'assistant').length
        : 0
    const prompt = buildTextValidationPrompt(text, {
      language,
      maxChars,
      pointType,
      history,
      askedCount,
      maxQuestions: 3,
      forceFinalize,
    })

    const schema = z.object({
      status: z.enum(['question', 'done']),
      question: z.string().optional(),
      improvedText: z.string(),
    })

    const modelName = AI_TEXT_COMPLETION_MODELS.includes(
      model as (typeof AI_TEXT_COMPLETION_MODELS)[number],
    )
      ? (model as (typeof AI_TEXT_COMPLETION_MODELS)[number])
      : 'gpt-5-mini'

    const { object } = await generateObject({
      model: openai(modelName),
      system: systemPrompt || SYSTEM_PROMPT_TEXT_VALIDATION,
      prompt,
      schema,
    })

    if (object.status === 'question' && !object.question) {
      return attachRequestId(
        NextResponse.json(
          { error: 'Missing question in response', details: object },
          { status: 500 },
        ),
        requestId,
      )
    }

    return attachRequestId(NextResponse.json(object), requestId)
  } catch (error) {
    return errorResponse(
      'aiTextValidationRoute',
      error,
      { error: 'Failed to validate text' },
      500,
      {},
      requestId,
    )
  }
}
