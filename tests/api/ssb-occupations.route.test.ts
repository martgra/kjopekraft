/// <reference types="vitest" />

import { NextRequest } from 'next/server'
import { GET } from '@/app/api/ssb/occupations/route'
import { getServerSession } from '@/services/auth/getSession'
import { checkAndSpendCredits, getDailyCreditsForUser } from '@/services/credits/creditsService'
import { getUserProfile } from '@/services/users/userProfileService'
import { hybridOccupationSearch } from '@/lib/ssb/occupationEmbeddingSearch'
import { searchSsbOccupations } from '@/lib/ssb/occupationSearch'

vi.mock('@/services/auth/getSession', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/services/credits/creditsService', () => ({
  checkAndSpendCredits: vi.fn(),
  getDailyCreditsForUser: vi.fn(),
}))

vi.mock('@/services/users/userProfileService', () => ({
  getUserProfile: vi.fn(),
}))

vi.mock('@/lib/ssb/occupationEmbeddingSearch', () => ({
  hybridOccupationSearch: vi.fn(),
}))

vi.mock('@/lib/ssb/occupationSearch', () => ({
  createOccupationFuse: vi.fn(() => ({})),
  searchSsbOccupations: vi.fn(() => [{ code: '1110', label: 'Test role', score: 0.1 }]),
  SSB_OCCUPATION_DOCS: [],
}))

const getServerSessionMock = vi.mocked(getServerSession)
const getDailyCreditsForUserMock = vi.mocked(getDailyCreditsForUser)
const checkAndSpendCreditsMock = vi.mocked(checkAndSpendCredits)
const getUserProfileMock = vi.mocked(getUserProfile)
const hybridOccupationSearchMock = vi.mocked(hybridOccupationSearch)
const searchSsbOccupationsMock = vi.mocked(searchSsbOccupations)

describe('GET /api/ssb/occupations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('flags credits exhausted when user has no remaining credits', async () => {
    getServerSessionMock.mockResolvedValue({
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
    })
    getUserProfileMock.mockResolvedValue({
      userId: 'user-1',
      timezone: 'UTC',
      aiEnabled: true,
    })
    getDailyCreditsForUserMock.mockResolvedValue({
      remaining: 0,
      credits: { dateKey: '2025-01-01', used: 10, limit: 10 },
    })
    hybridOccupationSearchMock.mockResolvedValue({
      results: [{ code: '2223', label: 'Sykepleiere', finalScore: 0.8 }],
      usedEmbedding: false,
      usedCachedEmbedding: false,
    })

    const response = await GET(new NextRequest('http://localhost/api/ssb/occupations?q=syk'))
    const payload = await response.json()

    expect(payload.creditsExhausted).toBe(true)
    expect(payload.spentCredits).toBe(false)
    expect(hybridOccupationSearchMock).toHaveBeenCalledWith('syk', 8, {
      allowEmbedding: false,
      allowCachedEmbedding: true,
    })
  })

  it('falls back to fuse search when embedding credits are denied', async () => {
    getServerSessionMock.mockResolvedValue({
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
    })
    getUserProfileMock.mockResolvedValue({
      userId: 'user-1',
      timezone: 'UTC',
      aiEnabled: true,
    })
    getDailyCreditsForUserMock.mockResolvedValue({
      remaining: 1,
      credits: { dateKey: '2025-01-01', used: 9, limit: 10 },
    })
    hybridOccupationSearchMock.mockResolvedValue({
      results: [{ code: '9999', label: 'Embedding result', finalScore: 0.7 }],
      usedEmbedding: true,
      usedCachedEmbedding: false,
    })
    checkAndSpendCreditsMock.mockResolvedValue({
      allowed: false,
      credits: { dateKey: '2025-01-01', used: 10, limit: 10 },
      remaining: 0,
    })

    const response = await GET(new NextRequest('http://localhost/api/ssb/occupations?q=dev'))
    const payload = await response.json()

    expect(payload.fallback).toBe(true)
    expect(payload.creditsExhausted).toBe(true)
    expect(payload.results).toEqual([
      {
        code: '1110',
        label: 'Test role',
        fuseScore: 0.1,
        finalScore: 0.9,
      },
    ])
    expect(searchSsbOccupationsMock).toHaveBeenCalled()
  })
})
