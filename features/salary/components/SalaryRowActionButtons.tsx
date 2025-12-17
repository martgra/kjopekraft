import type { PayPoint } from '@/domain/salary'
import { TEXT } from '@/lib/constants/text'

type ActionVariant = 'desktop' | 'mobile'

interface SalaryRowActionButtonsProps {
  payPoint: PayPoint
  variant: ActionVariant
  onEditPayPoint?: (point: PayPoint) => void
  onRemovePayPoint?: (year: number, pay: number) => void
  onAfterAction?: () => void
}

export function SalaryRowActionButtons({
  payPoint,
  variant,
  onEditPayPoint,
  onRemovePayPoint,
  onAfterAction,
}: SalaryRowActionButtonsProps) {
  if (!onEditPayPoint && !onRemovePayPoint) return null

  const isDesktop = variant === 'desktop'
  const editClassName = isDesktop
    ? 'inline-flex items-center gap-1 rounded-full bg-[var(--color-gray-50)] px-2 py-1 text-[var(--primary)] transition hover:bg-white hover:shadow-sm'
    : 'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--color-gray-50)]'
  const removeClassName = isDesktop
    ? 'inline-flex items-center gap-1 rounded-full bg-[var(--color-gray-50)] px-2 py-1 text-red-600 transition hover:bg-white hover:shadow-sm'
    : 'mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-red-600 hover:bg-[var(--color-gray-50)]'
  const editIconSize = isDesktop ? 'text-[16px]' : 'text-[18px]'
  const removeIconSize = isDesktop ? 'text-[16px]' : 'text-[18px]'

  return (
    <>
      {onEditPayPoint && (
        <button
          type="button"
          className={editClassName}
          onClick={() => {
            onEditPayPoint(payPoint)
            onAfterAction?.()
          }}
        >
          <span className={`material-symbols-outlined ${editIconSize}`}>edit</span>
          {TEXT.common.edit}
        </button>
      )}
      {onRemovePayPoint && (
        <button
          type="button"
          className={removeClassName}
          onClick={() => {
            onRemovePayPoint(payPoint.year, payPoint.pay)
            onAfterAction?.()
          }}
        >
          <span className={`material-symbols-outlined ${removeIconSize}`}>delete</span>
          {TEXT.common.remove}
        </button>
      )}
    </>
  )
}
