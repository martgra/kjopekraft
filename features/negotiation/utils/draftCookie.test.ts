/// <reference types="vitest" />

import {
  NEGOTIATION_DRAFT_COOKIE,
  defaultNegotiationDraft,
  parseDraft,
  readDraftFromDocument,
  serializeDraft,
} from './draftCookie'

describe('draftCookie utils', () => {
  it('returns defaults on empty or invalid input', () => {
    expect(parseDraft(undefined)).toEqual(defaultNegotiationDraft)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(parseDraft(encodeURIComponent('not json'))).toEqual(defaultNegotiationDraft)
    warnSpy.mockRestore()
  })

  it('serializes and parses round-trip', () => {
    const draft = {
      ...defaultNegotiationDraft,
      points: [{ description: 'I delivered X', type: 'custom' }],
      emailContent: 'hello',
      emailGenerationCount: 2,
    }
    const serialized = serializeDraft(draft)
    const parsed = parseDraft(serialized)
    expect(parsed.points[0]?.description).toBe('I delivered X')
    expect(parsed.emailContent).toBe('hello')
    expect(parsed.emailGenerationCount).toBe(2)
  })

  it('reads draft from document cookie when present', () => {
    const serialized = serializeDraft({ ...defaultNegotiationDraft, emailPrompt: 'prompt' })
    Object.defineProperty(document, 'cookie', {
      value: `${NEGOTIATION_DRAFT_COOKIE}=${serialized}`,
      writable: true,
    })
    const parsed = readDraftFromDocument()
    expect(parsed.emailPrompt).toBe('prompt')
  })
})
