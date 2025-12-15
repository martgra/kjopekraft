/// <reference types="vitest" />

import { getStortingReferenceSalary } from '@/services/storting/stortingSalaryService'
import { cacheLife, cacheTag } from 'next/cache'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch as unknown as typeof fetch

const sampleHtml = `
<html>
  <body>
    <table>
      <tr><th>Dato</th><th>Stortingsrepresentanter</th></tr>
      <tr><td>01.05.2020</td><td>800 000</td></tr>
      <tr><td>01.05.2021</td><td>820 000</td></tr>
    </table>
  </body>
</html>
`

describe('stortingSalaryService', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('parses HTML table into reference salary response', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => sampleHtml })

    const result = await getStortingReferenceSalary(2020)
    expect(mockFetch).toHaveBeenCalled()
    expect(cacheLife).toHaveBeenCalledWith('ssb')
    expect(cacheTag).toHaveBeenCalledWith('storting-salary')

    expect(result.source.provider).toBe('Stortinget')
    expect(result.series).toEqual([
      { year: 2020, value: 800000, status: null, type: 'official' },
      { year: 2021, value: 820000, status: null, type: 'official' },
    ])
  })

  it('throws on non-200 response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    await expect(getStortingReferenceSalary(2020)).rejects.toThrow(
      'Stortinget request failed (500)',
    )
  })

  it('throws when table is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => '<html><body>No table</body></html>',
    })
    await expect(getStortingReferenceSalary(2020)).rejects.toThrow(
      'Stortinget table not found in HTML',
    )
  })
})
