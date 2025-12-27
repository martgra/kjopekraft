/// <reference types="vitest" />

import { NextResponse } from 'next/server'
import { POST } from '@/app/api/generate/email/route'
import { requireLogin } from '@/services/auth/requireLogin'
import { checkAndSpendCredits } from '@/services/credits/creditsService'
import { getUserProfile } from '@/services/users/userProfileService'
import { buildEmailPrompt } from '@/lib/prompts'
import { generateText } from 'ai'
import { TEXT } from '@/lib/constants/text'

vi.mock('@/services/auth/requireLogin', () => ({
  requireLogin: vi.fn(),
}))

vi.mock('@/services/credits/creditsService', () => ({
  checkAndSpendCredits: vi.fn(),
}))

vi.mock('@/services/users/userProfileService', () => ({
  getUserProfile: vi.fn(),
}))

vi.mock('@/lib/prompts', () => ({
  buildEmailPrompt: vi.fn(() => 'prompt'),
  SYSTEM_PROMPT_EMAIL: 'system',
}))

vi.mock('ai', () => ({
  generateText: vi.fn(async () => ({ text: 'hello' })),
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'model'),
}))

const requireLoginMock = vi.mocked(requireLogin)
const checkAndSpendCreditsMock = vi.mocked(checkAndSpendCredits)
const getUserProfileMock = vi.mocked(getUserProfile)
const buildEmailPromptMock = vi.mocked(buildEmailPrompt)
const generateTextMock = vi.mocked(generateText)

describe('POST /api/generate/email', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns auth response when requireLogin blocks', async () => {
    requireLoginMock.mockResolvedValue({
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await POST(
      new Request('http://localhost/api/generate/email', { method: 'POST' }),
    )
    expect(response.status).toBe(401)
  })

  it('returns 429 when credits are exhausted', async () => {
    requireLoginMock.mockResolvedValue({
      session: {
        session: {
          id: 'session-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
          expiresAt: new Date(),
          token: 'token',
          ipAddress: null,
          userAgent: null,
        },
        user: {
          id: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'test@example.com',
          emailVerified: true,
          name: 'Test User',
          image: null,
        },
      },
      response: null,
    })
    getUserProfileMock.mockResolvedValue({
      userId: 'user-1',
      timezone: 'UTC',
      aiEnabled: true,
    })
    checkAndSpendCreditsMock.mockResolvedValue({
      allowed: false,
      credits: { dateKey: '2025-01-01', used: 5, limit: 5 },
      remaining: 0,
    })

    const response = await POST(
      new Request('http://localhost/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: [], userInfo: {}, context: {} }),
      }),
    )

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: TEXT.credits.exhausted })
  })

  it('returns generated email content when allowed', async () => {
    requireLoginMock.mockResolvedValue({
      session: {
        session: {
          id: 'session-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-1',
          expiresAt: new Date(),
          token: 'token',
          ipAddress: null,
          userAgent: null,
        },
        user: {
          id: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          email: 'test@example.com',
          emailVerified: true,
          name: 'Test User',
          image: null,
        },
      },
      response: null,
    })
    getUserProfileMock.mockResolvedValue({
      userId: 'user-1',
      timezone: 'UTC',
      aiEnabled: true,
    })
    checkAndSpendCreditsMock.mockResolvedValue({
      allowed: true,
      credits: { dateKey: '2025-01-01', used: 1, limit: 5 },
      remaining: 4,
    })

    const response = await POST(
      new Request('http://localhost/api/generate/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: [{ description: 'Point', type: 'custom' }],
          userInfo: {
            jobTitle: '',
            industry: '',
            isNewJob: false,
            currentSalary: '',
            desiredSalary: '',
            achievements: '',
            marketData: '',
            benefits: [],
            otherBenefits: '',
          },
          context: {},
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ result: 'hello', prompt: 'prompt' })
    expect(buildEmailPromptMock).toHaveBeenCalled()
    expect(generateTextMock).toHaveBeenCalled()
  })
})
