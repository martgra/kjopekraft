import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SalaryPointForm from '@/components/dashboard/SalaryPointForm'

describe('SalaryPointForm', () => {
  const defaultProps = {
    newYear: '',
    newPay: '',
    newReason: 'adjustment' as const,
    currentYear: 2024,
    minYear: 2020,
    onYearChange: vi.fn(),
    onPayChange: vi.fn(),
    onReasonChange: vi.fn(),
    onAdd: vi.fn(),
  }

  it('renders all form fields', () => {
    render(<SalaryPointForm {...defaultProps} />)

    expect(screen.getByTestId('salary-form-year-input')).toBeInTheDocument()
    expect(screen.getByTestId('salary-form-amount-input')).toBeInTheDocument()
    expect(screen.getByTestId('salary-form-reason-select')).toBeInTheDocument()
    expect(screen.getByTestId('salary-form-submit-button')).toBeInTheDocument()
  })

  it('defaults to adjustment reason when provided', () => {
    render(<SalaryPointForm {...defaultProps} newReason="adjustment" />)

    const reasonSelect = screen.getByTestId('salary-form-reason-select') as HTMLSelectElement
    expect(reasonSelect.value).toBe('adjustment')
  })

  it('has all three reason options', () => {
    render(<SalaryPointForm {...defaultProps} />)

    const reasonSelect = screen.getByTestId('salary-form-reason-select')
    const options = Array.from(reasonSelect.querySelectorAll('option'))

    expect(options).toHaveLength(4) // Empty + 3 reasons
    expect(options.map(o => o.value)).toEqual(['', 'adjustment', 'promotion', 'newJob'])
  })

  it('calls onReasonChange when reason is changed', async () => {
    const onReasonChange = vi.fn()
    render(<SalaryPointForm {...defaultProps} onReasonChange={onReasonChange} />)

    const reasonSelect = screen.getByTestId('salary-form-reason-select')
    await userEvent.selectOptions(reasonSelect, 'promotion')

    expect(onReasonChange).toHaveBeenCalledWith('promotion')
  })

  it('shows numeric keypad for year input', () => {
    render(<SalaryPointForm {...defaultProps} />)

    const yearInput = screen.getByTestId('salary-form-year-input')
    expect(yearInput).toHaveAttribute('inputmode', 'numeric')
    expect(yearInput).toHaveAttribute('pattern', '[0-9]*')
    expect(yearInput.getAttribute('type')).toBe('text')
  })

  it('calls onYearChange when year is changed', async () => {
    const onYearChange = vi.fn()
    render(<SalaryPointForm {...defaultProps} onYearChange={onYearChange} />)

    const yearInput = screen.getByTestId('salary-form-year-input')
    await userEvent.type(yearInput, '2023')

    expect(onYearChange).toHaveBeenCalled()
  })

  it('calls onPayChange when amount is changed', async () => {
    const onPayChange = vi.fn()
    render(<SalaryPointForm {...defaultProps} onPayChange={onPayChange} />)

    const amountInput = screen.getByTestId('salary-form-amount-input')
    await userEvent.type(amountInput, '500000')

    expect(onPayChange).toHaveBeenCalled()
  })

  it('disables submit button when instructed', () => {
    render(<SalaryPointForm {...defaultProps} isSubmitDisabled />)

    const submitButton = screen.getByTestId('salary-form-submit-button')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when not disabled', () => {
    render(<SalaryPointForm {...defaultProps} isSubmitDisabled={false} />)

    const submitButton = screen.getByTestId('salary-form-submit-button')
    expect(submitButton).not.toBeDisabled()
  })

  it('calls onAdd when submit button is clicked', async () => {
    const onAdd = vi.fn()
    render(
      <SalaryPointForm
        {...defaultProps}
        newYear="2023"
        newPay="500000"
        newReason="adjustment"
        onAdd={onAdd}
      />,
    )

    const submitButton = screen.getByTestId('salary-form-submit-button')
    await userEvent.click(submitButton)

    expect(onAdd).toHaveBeenCalled()
  })

  it('displays validation error when provided', () => {
    const errorMessage = 'År må være mellom 2020 og 2024'
    render(<SalaryPointForm {...defaultProps} validationError={errorMessage} />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('shows gross amount label when not in net mode', () => {
    render(<SalaryPointForm {...defaultProps} isNetMode={false} />)

    expect(screen.getByText(/beløp før skatt/i)).toBeInTheDocument()
  })

  it('shows net amount label when in net mode', () => {
    render(<SalaryPointForm {...defaultProps} isNetMode={true} />)

    expect(screen.getByText(/beløp etter skatt/i)).toBeInTheDocument()
  })
})
