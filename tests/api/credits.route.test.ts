/// <reference types="vitest" />

import { NextResponse } from 'next/server'
import { GET } from '@/app/api/credits/route'
import { requireLogin } from '@/services/auth/requireLogin'
import { getDailyCreditsForUser } from '@/services/credits/creditsService'
import { getUserProfile } from '@/services/users/userProfileService'

vi.mock('@/services/auth/requireLogin', () => ({
  requireLogin: vi.fn(),
}))

vi.mock('@/services/credits/creditsService', () => ({
  getDailyCreditsForUser: vi.fn(),
}))

vi.mock('@/services/users/userProfileService', () => ({
  getUserProfile: vi.fn(),
}))

const requireLoginMock = vi.mocked(requireLogin)
const getDailyCreditsForUserMock = vi.mocked(getDailyCreditsForUser)
const getUserProfileMock = vi.mocked(getUserProfile)

describe('GET /api/credits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns auth response when requireLogin blocks', async () => {
    requireLoginMock.mockResolvedValue({
      session: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET(new Request('http://localhost/api/credits'))
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

    const response = await GET(new Request('http://localhost/api/credits'))
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns credit snapshot for signed-in users', async () => {
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
      timezone: 'Europe/Oslo',
      aiEnabled: true,
    })
    getDailyCreditsForUserMock.mockResolvedValue({
      remaining: 3,
      credits: { dateKey: '2025-01-01', used: 2, limit: 5 },
    })

    const response = await GET(new Request('http://localhost/api/credits'))
    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      dateKey: '2025-01-01',
      credits: { used: 2, limit: 5, remaining: 3 },
    })
  })
})
