import { renderHook } from '@testing-library/react'
import type { MockedFunction } from 'vitest'
import useSWR, { type SWRResponse } from 'swr'
import type { ReferenceSalaryResponse } from '@/features/referenceSalary/types'
import { useReferenceSalary } from '@/features/referenceSalary/hooks/useReferenceSalary'

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}))

const useSWRMock = useSWR as unknown as MockedFunction<typeof useSWR>

const createSWRMockResponse = (
  overrides: Partial<SWRResponse<ReferenceSalaryResponse, Error>> = {},
) =>
  ({
    data: overrides.data ?? undefined,
    error: overrides.error ?? undefined,
    mutate: vi.fn<ReturnType<typeof useSWR>['mutate']>(),
    isValidating: false,
    isLoading: false,
    ...overrides,
  }) as ReturnType<typeof useSWR>

const baseResponse = {
  source: { provider: 'SSB', table: '11418' } as const,
  occupation: { code: '1120', label: 'Managers' },
  filters: { contents: '111', stat: '111', sector: '6500', sex: 'total', hours: 'all' },
}

describe('useReferenceSalary', () => {
  beforeEach(() => {
    useSWRMock.mockReset()
  })

  it('returns empty data when disabled and does not request', () => {
    useSWRMock.mockReturnValue(createSWRMockResponse())

    const { result } = renderHook(() => useReferenceSalary({ enabled: false }))

    expect(useSWRMock).toHaveBeenCalledWith(null, expect.any(Function), expect.any(Object))
    expect(result.current.data).toEqual([])
    expect(result.current.metadata).toBeNull()
    expect(result.current.error).toBeUndefined()
  })

  it('builds SSB URL with sector and prefers derived yearly series for monthly data', () => {
    const response: ReferenceSalaryResponse = {
      ...baseResponse,
      unit: 'NOK/month',
      reference: {},
      series: [{ year: 2020, value: 10_000, type: 'official' }],
      derived: { yearlyNok: [{ year: 2020, value: 120_000, type: 'official' }] },
    }
    useSWRMock.mockReturnValue(createSWRMockResponse({ data: response }))

    const { result } = renderHook(() =>
      useReferenceSalary({ occupation: 'managersMunicipal', fromYear: 2010 }),
    )

    expect(useSWRMock).toHaveBeenCalledTimes(1)
    const [apiUrl] = useSWRMock.mock.calls[0] as [string, unknown, unknown]
    expect(apiUrl).toBe('/api/ssb/salary?occupation=1120&fromYear=2010&sector=6500')
    expect(result.current.data).toEqual(response.derived?.yearlyNok)
    expect(result.current.metadata).toEqual({
      occupation: { code: '1120', label: 'Ledere i offentlig sektor (kommune)' },
      unit: response.unit,
      source: response.source,
      filters: response.filters,
    })
  })

  it('uses provider-specific path and available-from year for Stortinget data', () => {
    const response: ReferenceSalaryResponse = {
      ...baseResponse,
      source: { provider: 'Stortinget', table: 'Lonnsutvikling' },
      occupation: { code: 'stortingsrepresentant', label: 'Stortingsrepresentant' },
      unit: 'NOK/year',
      reference: {},
      filters: {},
      series: [{ year: 2001, value: 500_000, type: 'official' }],
    }
    useSWRMock.mockReturnValue(createSWRMockResponse({ data: response }))

    renderHook(() => useReferenceSalary({ occupation: 'stortingsrepresentant', fromYear: 1990 }))

    const [apiUrl] = useSWRMock.mock.calls[0] as [string, unknown, unknown]
    expect(apiUrl).toBe('/api/reference/storting?fromYear=2001')
  })
})
