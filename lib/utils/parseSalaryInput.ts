export function parseSalaryInput(value: string | null | undefined): number | null {
  if (!value) return null
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return null
  const parsed = Number.parseInt(digits, 10)
  return Number.isNaN(parsed) ? null : parsed
}
