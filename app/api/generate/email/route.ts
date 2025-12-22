import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { buildEmailPrompt, SYSTEM_PROMPT_EMAIL } from '@/lib/prompts'
import type {
  NegotiationEmailContext,
  NegotiationPoint,
  NegotiationUserInfo,
} from '@/lib/models/types'
import { requireLogin } from '@/services/auth/requireLogin'

export const maxDuration = 30 // Allow responses up to 30 seconds

export async function POST(req: Request) {
  try {
    const { response } = await requireLogin(req)
    if (response) return response

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
    return NextResponse.json({ result: text, prompt: prompt })
  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
