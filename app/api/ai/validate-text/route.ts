import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { buildTextValidationPrompt, SYSTEM_PROMPT_TEXT_VALIDATION } from '@/lib/prompts'
import { AI_TEXT_COMPLETION_MODELS } from '@/lib/ai/models'

export const maxDuration = 30 // Allow responses up to 30 seconds

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    if (typeof maxChars === 'number' && text.length > maxChars) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 })
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
      return NextResponse.json(
        { error: 'Missing question in response', details: object },
        { status: 500 },
      )
    }

    return NextResponse.json(object)
  } catch (error) {
    console.error('Text validation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to validate text',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
