/// <reference types="vitest" />

import { saveNegotiationDraft } from '@/features/negotiation/actions/saveNegotiationDraft'
import { NEGOTIATION_DRAFT_COOKIE } from '@/features/negotiation/utils/draftCookie'

const setMock = vi.fn()
vi.mock('next/headers', () => ({
  cookies: () => ({
    set: setMock,
  }),
}))

describe('saveNegotiationDraft', () => {
  beforeEach(() => {
    setMock.mockReset()
  })

  it('returns error when draft payload missing', async () => {
    const formData = new FormData()
    const result = await saveNegotiationDraft({ status: 'idle' }, formData)
    expect(result).toEqual({ status: 'error', message: 'Draft payload missing' })
    expect(setMock).not.toHaveBeenCalled()
  })

  it('parses payload and sets cookie', async () => {
    const payload = {
      points: [{ description: 'Point', type: 'custom' }],
      emailPrompt: 'prompt',
    }
    const formData = new FormData()
    formData.set('draft', JSON.stringify(payload))

    const result = await saveNegotiationDraft({ status: 'idle' }, formData)
    expect(result).toEqual({ status: 'saved' })
    expect(setMock).toHaveBeenCalledWith(
      NEGOTIATION_DRAFT_COOKIE,
      expect.stringContaining('emailPrompt'),
      expect.objectContaining({ path: '/' }),
    )
  })

  it('returns error on invalid JSON', async () => {
    const formData = new FormData()
    formData.set('draft', 'not-json')
    const result = await saveNegotiationDraft({ status: 'idle' }, formData)
    expect(result.status).toBe('error')
  })
})
