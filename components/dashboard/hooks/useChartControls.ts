import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import type { PayPoint } from '@/domain/salary'
import type { OccupationKey } from '@/features/referenceSalary/occupations'
import { viewModes, type ViewMode } from '@/lib/searchParams'

interface UseChartControlsParams {
  payPoints: PayPoint[]
  isReferenceEnabled: boolean
  toggleReference: () => void
}

export function useChartControls({
  payPoints,
  isReferenceEnabled,
  toggleReference,
}: UseChartControlsParams) {
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationKey | 'none'>('none')
  const [apiError, setApiError] = useState<string | null>(null)
  const [showEventBaselines, setShowEventBaselines] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('salary-show-event-baselines')
      return stored === 'true'
    }
    return false
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [viewMode, setViewMode] = useQueryState<ViewMode>(
    'view',
    parseAsStringLiteral(viewModes).withDefault('graph'),
  )

  useEffect(() => {
    localStorage.setItem('salary-show-event-baselines', String(showEventBaselines))
  }, [showEventBaselines])

  const handleOccupationChange = (value: string) => {
    setSelectedOccupation(value as OccupationKey | 'none')
    setApiError(null)
    if (value === 'none' && isReferenceEnabled) {
      toggleReference()
    } else if (value !== 'none' && !isReferenceEnabled) {
      toggleReference()
    }
  }

  const handleReferenceError = useCallback(
    (referenceError: string | null) => {
      if (!referenceError) return
      setApiError('Kunne ikke laste referansedata. Referansesammenligningen er deaktivert.')
      setSelectedOccupation('none')
      if (isReferenceEnabled) {
        toggleReference()
      }
    },
    [isReferenceEnabled, toggleReference],
  )

  const occupationKey: OccupationKey | undefined =
    selectedOccupation === 'none' ? undefined : selectedOccupation

  const hasEventReasons = useMemo(
    () => payPoints.some(point => point.reason === 'promotion' || point.reason === 'newJob'),
    [payPoints],
  )

  return {
    viewMode,
    setViewMode,
    showEventBaselines,
    setShowEventBaselines,
    isSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    selectedOccupation,
    occupationKey,
    handleOccupationChange,
    apiError,
    hasEventReasons,
    handleReferenceError,
  }
}
