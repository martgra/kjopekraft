import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AIAssistedField } from '@/components/ai/AIAssistedField'
import { TEXT } from '@/lib/constants/text'

const startValidation = vi.fn()
const answerQuestion = vi.fn()
const finalizeEarly = vi.fn()
const reset = vi.fn()

let mockSuggestion = ''
let mockCanValidate = true
let mockPendingQuestion: string | null = null
let mockIsLoading = false
let mockStatus: 'question' | 'done' | null = null

const mockValidator = {
  suggestion: '',
  messages: [] as unknown[],
  pendingQuestion: null as string | null,
  status: null as 'question' | 'done' | null,
  isOpen: false,
  isLoading: false,
  error: null as string | null,
  canValidate: () => mockCanValidate,
  startValidation,
  answerQuestion,
  finalizeEarly,
  handleTrigger: vi.fn(),
  openOverlay: vi.fn(),
  closeOverlay: vi.fn(),
  commitSuggestion: vi.fn(),
  reset,
}

vi.mock('@/features/aiTextValidator/useAiTextValidator', () => ({
  useAiTextValidator: () => mockValidator,
}))

describe('AIAssistedField', () => {
  beforeEach(() => {
    startValidation.mockClear()
    answerQuestion.mockClear()
    finalizeEarly.mockClear()
    reset.mockClear()
    mockSuggestion = ''
    mockPendingQuestion = null
    mockIsLoading = false
    mockCanValidate = true
    mockStatus = null
    mockValidator.suggestion = ''
    mockValidator.pendingQuestion = null
    mockValidator.isLoading = false
    mockValidator.status = null
  })

  it('triggers AI validation and applies suggestion to the field', async () => {
    mockSuggestion = 'AI forbedret tekst'
    mockValidator.suggestion = mockSuggestion
    const onChange = vi.fn()

    render(
      <AIAssistedField
        value="Original"
        onChange={onChange}
        placeholder="Beskriv nøkkelpunktet ditt..."
        pointType="Achievement"
      />,
    )

    const improveButton = screen.getByRole('button', { name: /forbedre tekst/i })
    fireEvent.click(improveButton)

    await waitFor(() => {
      expect(startValidation).toHaveBeenCalledWith('Original', { pointType: 'Achievement' })
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('AI forbedret tekst')
    })
  })

  it('shows revert after AI update and restores the previous value', async () => {
    mockSuggestion = 'AI forslag'
    mockValidator.suggestion = mockSuggestion
    const onChange = vi.fn()

    render(
      <AIAssistedField
        value="Original"
        onChange={onChange}
        placeholder="Beskriv nøkkelpunktet ditt..."
      />,
    )

    const improveButton = screen.getByRole('button', { name: /forbedre tekst/i })
    fireEvent.click(improveButton)

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('AI forslag')
    })

    const revertButton = await screen.findByLabelText(TEXT.common.reset)
    fireEvent.click(revertButton)

    expect(reset).toHaveBeenCalled()
    expect(onChange).toHaveBeenLastCalledWith('Original')
  })

  it('disables improve when validation is not allowed', () => {
    mockCanValidate = false
    const onChange = vi.fn()

    render(
      <AIAssistedField value="" onChange={onChange} placeholder="Beskriv nøkkelpunktet ditt..." />,
    )

    const improveButton = screen.getByRole('button', { name: /forbedre tekst/i })
    expect(improveButton).toBeDisabled()
  })
})
