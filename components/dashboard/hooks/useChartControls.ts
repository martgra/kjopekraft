import { useCallback, useState } from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import type { PayPoint } from '@/domain/salary'
import type { OccupationSelection } from '@/lib/ssb/occupationSelection'
import { viewModes, type ViewMode } from '@/lib/searchParams'

interface UseChartControlsParams {
  payPoints: PayPoint[]
  isReferenceEnabled: boolean
  toggleReference: () => void
}

export function useChartControls({
  payPoints: _payPoints,
  isReferenceEnabled,
  toggleReference,
}: UseChartControlsParams) {
  void _payPoints
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationSelection | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [viewMode, setViewMode] = useQueryState<ViewMode>(
    'view',
    parseAsStringLiteral(viewModes).withDefault('graph'),
  )

  const handleOccupationChange = (value: OccupationSelection | null) => {
    setSelectedOccupation(value)
    setApiError(null)
    if (!value && isReferenceEnabled) {
      toggleReference()
    } else if (value && !isReferenceEnabled) {
      toggleReference()
    }
  }

  const handleReferenceError = useCallback(
    (referenceError: string | null) => {
      if (!referenceError) return
      setApiError('Kunne ikke laste referansedata. Referansesammenligningen er deaktivert.')
      setSelectedOccupation(null)
      if (isReferenceEnabled) {
        toggleReference()
      }
    },
    [isReferenceEnabled, toggleReference],
  )

  return {
    viewMode,
    setViewMode,
    isSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false),
    selectedOccupation,
    handleOccupationChange,
    apiError,
    handleReferenceError,
  }
}
