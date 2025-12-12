import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateText, stepCountIs } from 'ai'
import { buildPlaybookPrompt, SYSTEM_PROMPT_PLAYBOOK } from '@/lib/prompts'
import { NegotiationPoint, NegotiationUserInfo } from '@/lib/models/types'
import { ssbToolset } from '@/lib/ssb/ssbTools'

export const maxDuration = 30 // Allow responses up to 30 seconds

export async function POST(req: Request) {
  try {
    const { points, userInfo } = (await req.json()) as {
      points: NegotiationPoint[]
      userInfo: NegotiationUserInfo
    }

    const prompt = buildPlaybookPrompt(points, userInfo)

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT_PLAYBOOK,
      prompt,
      tools: ssbToolset,
      stopWhen: stepCountIs(5),
    })

    return NextResponse.json({ result: text, prompt: prompt })
  } catch (error) {
    console.error('Playbook generation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate playbook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
