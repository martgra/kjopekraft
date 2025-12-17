import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePayPointFormState } from '@/features/salary/hooks/usePayPointFormState'
import type { PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'

const payPoints: PayPoint[] = [
  { id: 'p1', year: 2020, pay: 500000, reason: 'newJob' },
  { id: 'p2', year: 2021, pay: 520000, reason: 'adjustment' },
]

describe('usePayPointFormState', () => {
  const addPoint = vi.fn()
  const removePoint = vi.fn()

  beforeEach(() => {
    addPoint.mockClear()
    removePoint.mockClear()
  })

  const setup = (overrides?: Partial<Parameters<typeof usePayPointFormState>[0]>) =>
    renderHook(() =>
      usePayPointFormState({
        payPoints,
        currentYear: 2025,
        inflationData: [],
        hasData: true,
        addPoint,
        removePoint,
        ...overrides,
      }),
    )

  it('rejects duplicate year and sets validation error', () => {
    const { result } = setup()

    act(() => result.current.setters.setYear('2020'))
    act(() => result.current.setters.setPay('600000'))
    act(() => result.current.setters.setReason('adjustment'))

    act(() => result.current.submitPoint())

    expect(result.current.validationError).toBeTruthy()
    expect(addPoint).not.toHaveBeenCalled()
  })

  it('formats pay input with spaces', () => {
    const { result } = setup()

    act(() => result.current.setters.setPay('500000'))

    expect(result.current.fields.pay).toBe('500 000')
  })

  it('enables submit when all required fields are valid', () => {
    const { result } = setup()

    act(() => result.current.setters.setYear('2022'))
    act(() => result.current.setters.setPay('600000'))
    act(() => result.current.setters.setReason('adjustment'))

    expect(result.current.isSubmitDisabled).toBe(false)
  })

  it('adds point and advances year when valid', () => {
    const { result } = setup()

    act(() => result.current.setters.setYear('2022'))
    act(() => result.current.setters.setPay('600000'))
    act(() => result.current.setters.setReason('adjustment'))

    act(() => result.current.submitPoint())

    expect(addPoint).toHaveBeenCalled()
    expect(result.current.fields.year).toBe('2023')
  })

  it('clears demo state when adding real data in demo mode', () => {
    const demoPoints: PayPoint[] = [{ id: 'd1', year: 2019, pay: 450000, reason: 'adjustment' }]
    const { result } = setup({ hasData: false })

    // Seed demo mode
    localStorage.setItem('salary-calculator-points', 'demo')
    act(() => result.current.loadDemoData(demoPoints))

    act(() => result.current.setters.setYear('2022'))
    act(() => result.current.setters.setPay('600000'))
    act(() => result.current.setters.setReason('adjustment'))

    act(() => result.current.submitPoint())

    expect(localStorage.getItem('salary-calculator-points')).toBeNull()
  })

  describe('editing behavior', () => {
    it('allows editing a point and keeping the same year', () => {
      const { result } = setup()

      // Begin editing the 2020 point
      const pointToEdit = payPoints[0]! // { id: 'p1', year: 2020, pay: 500000, reason: 'newJob' }
      act(() => result.current.beginEditing(pointToEdit))

      // Verify form is populated
      expect(result.current.fields.year).toBe('2020')
      expect(result.current.fields.pay).toBe('500000')

      // Change only the pay amount, keep the same year
      act(() => result.current.setters.setPay('550000'))

      // Should allow submission without duplicate year error
      act(() => result.current.submitPoint())

      expect(result.current.validationError).toBe('')
      expect(removePoint).toHaveBeenCalledWith(2020, 500000)
      expect(addPoint).toHaveBeenCalledWith({
        id: 'p1',
        year: 2020,
        pay: 550000,
        reason: 'newJob',
        note: undefined,
      })
    })

    it('rejects editing a point to a year that already exists', () => {
      const { result } = setup()

      // Begin editing the 2020 point
      const pointToEdit = payPoints[0]! // { id: 'p1', year: 2020, pay: 500000, reason: 'newJob' }
      act(() => result.current.beginEditing(pointToEdit))

      // Try to change year to 2021 (which already exists with id 'p2')
      act(() => result.current.setters.setYear('2021'))
      act(() => result.current.setters.setPay('550000'))

      // Should reject with duplicate year error
      act(() => result.current.submitPoint())

      expect(result.current.validationError).toBeTruthy()
      expect(removePoint).not.toHaveBeenCalled()
      expect(addPoint).not.toHaveBeenCalled()
    })

    it('allows editing a point to a new year that does not exist', () => {
      const { result } = setup()

      // Begin editing the 2020 point
      const pointToEdit = payPoints[0]! // { id: 'p1', year: 2020, pay: 500000, reason: 'newJob' }
      act(() => result.current.beginEditing(pointToEdit))

      // Change to a new year that doesn't exist (2022)
      act(() => result.current.setters.setYear('2022'))
      act(() => result.current.setters.setPay('550000'))

      // Should allow submission
      act(() => result.current.submitPoint())

      expect(result.current.validationError).toBe('')
      expect(removePoint).toHaveBeenCalledWith(2020, 500000)
      expect(addPoint).toHaveBeenCalledWith({
        id: 'p1',
        year: 2022,
        pay: 550000,
        reason: 'newJob',
        note: undefined,
      })
    })

    it('clears editing state after successful edit', () => {
      const { result } = setup()

      const pointToEdit = payPoints[0]!
      act(() => result.current.beginEditing(pointToEdit))

      act(() => result.current.setters.setPay('550000'))
      act(() => result.current.submitPoint())

      // Editing state should be cleared
      expect(result.current.validationError).toBe('')
      // Form should be reset with next year
      expect(result.current.fields.year).toBe('2022')
    })

    it('can cancel editing without submitting', () => {
      const { result } = setup()

      const pointToEdit = payPoints[0]!
      act(() => result.current.beginEditing(pointToEdit))

      expect(result.current.fields.year).toBe('2020')

      // Clear editing without submitting
      act(() => result.current.clearEditing())

      expect(result.current.validationError).toBe(TEXT.forms.validation.yearExists)
      expect(addPoint).not.toHaveBeenCalled()
      expect(removePoint).not.toHaveBeenCalled()
    })
  })
})
