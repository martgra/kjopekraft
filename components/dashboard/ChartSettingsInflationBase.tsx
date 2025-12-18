import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'

interface ChartSettingsInflationBaseOption {
  value: string
  label: string
}

interface ChartSettingsInflationBaseProps {
  value: string
  options: ChartSettingsInflationBaseOption[]
  onChange: (value: string) => void
}

export function ChartSettingsInflationBase({
  value,
  options,
  onChange,
}: ChartSettingsInflationBaseProps) {
  const testId = createTestId('chart-settings-inflation-base')
  const [draft, setDraft] = useState(value)
  const [error, setError] = useState<string | undefined>(undefined)

  const allowedYears = useMemo(
    () =>
      options
        .map(option => Number(option.value))
        .filter(year => Number.isFinite(year))
        .map(year => String(year)),
    [options],
  )

  useEffect(() => {
    setDraft(value)
    setError(undefined)
  }, [value])

  const handleChange = (next: string) => {
    const trimmed = next.trim().toLowerCase()
    setDraft(next)

    if (!trimmed || trimmed === 'auto') {
      setError(undefined)
      onChange('auto')
      return
    }

    const asNumber = Number(trimmed)
    const asString = String(asNumber)
    if (Number.isFinite(asNumber) && allowedYears.includes(asString)) {
      setError(undefined)
      onChange(asString)
      return
    }

    setError(TEXT.settings.inflationBaseInvalid)
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4" data-testid={testId('container')}>
      <div>
        <div className="text-sm font-semibold text-[var(--text-main)]">
          {TEXT.settings.inflationBaseTitle}
        </div>
        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
          {TEXT.settings.inflationBaseSubtitle}
        </div>
      </div>
      <Input
        value={draft}
        onChange={event => handleChange(event.target.value)}
        placeholder="auto"
        aria-label={TEXT.settings.inflationBaseTitle}
        data-testid={testId('select')}
        inputMode="numeric"
        pattern="[0-9]*"
        className="w-28 text-sm"
        hint={TEXT.settings.inflationBaseHint}
        error={error}
      />
    </div>
  )
}
