/**
 * Small helper to create hierarchical `data-testid` values.
 * Keeps IDs predictable (`section-element-state`) while avoiding string duplication.
 *
 * Example:
 * const salaryFormTestId = createTestId('salary-form')
 * salaryFormTestId('year-input') // -> "salary-form-year-input"
 */
export function createTestId(base: string) {
  return (suffix?: string | string[]) => {
    if (!suffix) return base
    const segments = Array.isArray(suffix) ? suffix : [suffix]
    return [base, ...segments].join('-')
  }
}
