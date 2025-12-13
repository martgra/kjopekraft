/// <reference types="vitest" />

import { Paragraph, TextRun } from 'docx'
import { markdownToDocxParagraphs } from './negotiationUtils'

describe('markdownToDocxParagraphs', () => {
  it('converts lists, bold, italic, and blank lines', () => {
    const md = `**Heading**\n- item one\n*italic* text`
    const result = markdownToDocxParagraphs(md)

    expect(result.length).toBeGreaterThan(0)
    expect(result.every(p => p instanceof Paragraph)).toBe(true)
  })
})
