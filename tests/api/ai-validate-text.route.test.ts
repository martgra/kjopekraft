/// <reference types="vitest" />

import { NextResponse } from 'next/server'
import { POST } from '@/app/api/ai/validate-text/route'
import { requireLogin } from '@/services/auth/requireLogin'
import { checkAndSpendCredits } from '@/services/credits/creditsService'
import { getUserProfile } from '@/services/users/userProfileService'
import { generateObject } from 'ai'
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

vi.mock('ai', () => ({
  generateObject: vi.fn(async () => ({
    object: { status: 'done', improvedText: 'better', question: undefined },
  })),
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'model'),
}))

const requireLoginMock = vi.mocked(requireLogin)
const checkAndSpendCreditsMock = vi.mocked(checkAndSpendCredits)
const getUserProfileMock = vi.mocked(getUserProfile)
const generateObjectMock = vi.mocked(generateObject)

describe('POST /api/ai/validate-text', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns auth response when requireLogin blocks', async () => {
    requireLoginMock.mockResolvedValue({
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await POST(
      new Request('http://localhost/api/ai/validate-text', { method: 'POST' }),
    )
    expect(response.status).toBe(401)
  })

  it('returns 401 when session has no user id', async () => {
    requireLoginMock.mockResolvedValue({
      session: {
        session: {
          id: 'session-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: '',
          expiresAt: new Date(),
          token: 'token',
          ipAddress: null,
          userAgent: null,
        },
        user: {
          id: '',
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

    const response = await POST(
      new Request('http://localhost/api/ai/validate-text', { method: 'POST' }),
    )
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: TEXT.auth.loginRequired })
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
      new Request('http://localhost/api/ai/validate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hello' }),
      }),
    )

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: TEXT.credits.exhausted })
  })

  it('returns validation response when allowed', async () => {
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
      new Request('http://localhost/api/ai/validate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'hello' }),
      }),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      status: 'done',
      improvedText: 'better',
      question: undefined,
    })
    expect(generateObjectMock).toHaveBeenCalled()
  })
})
