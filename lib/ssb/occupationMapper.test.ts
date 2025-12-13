/// <reference types="vitest" />

import { getOccupationByCode, mapJobTitleToOccupation } from './occupationMapper'

describe('occupationMapper', () => {
  it('returns null for empty titles', () => {
    expect(mapJobTitleToOccupation('')).toBeNull()
  })

  it('maps software engineer to dev code with approximate flag', () => {
    const match = mapJobTitleToOccupation('Software developer backend')
    expect(match?.code).toBe('2512')
    expect(match?.isApproximate).toBe(true)
    expect(match?.confidence).toBeGreaterThan(0.6)
  })

  it('looks up occupation by code', () => {
    expect(getOccupationByCode('2223')).toMatchObject({
      code: '2223',
      label: expect.any(String),
      confidence: 1,
      isApproximate: false,
    })
  })
})
