'use client'

import { useEffect, useState } from 'react'
import { TEXT } from '@/lib/constants/text'
import { AILoadingState, Button, Icon } from '@/components/ui/atoms'

export interface AiTextValidatorOverlayProps {
  isOpen: boolean
  suggestion: string
  pendingQuestion?: string | null
  isLoading?: boolean
  error?: string | null
  onClose: () => void
  onCommit: (value: string) => void
  onRetry?: () => void
  onSendAnswer?: (value: string) => void
  onFinalizeEarly?: () => void | Promise<void>
}

export function AiTextValidatorOverlay({
  isOpen,
  suggestion,
  pendingQuestion = null,
  isLoading = false,
  error = null,
  onClose,
  onCommit,
  onRetry,
  onSendAnswer,
  onFinalizeEarly,
}: AiTextValidatorOverlayProps) {
  const [draft, setDraft] = useState(suggestion)
  const [answerDraft, setAnswerDraft] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (suggestion) {
      setDraft(suggestion)
    }
    setAnswerDraft('')
    setShowSuggestion(false)
  }, [isOpen, suggestion])

  if (!isOpen) return null

  const isCommitDisabled = isLoading || !draft.trim()
  const isQuestionStage = Boolean(pendingQuestion) || isLoading
  const isSuggestionStage = !isQuestionStage && Boolean(draft.trim())
  const headerTitle = isQuestionStage
    ? TEXT.aiValidator.overlayQuestionTitle
    : TEXT.aiValidator.overlaySuggestionTitle
  const headerHint = isQuestionStage
    ? TEXT.aiValidator.overlayQuestionHint
    : TEXT.aiValidator.overlaySuggestionHint

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-center px-3 pb-3 sm:items-center sm:px-4">
        <div
          className="pointer-events-auto relative flex min-h-[520px] w-full max-w-sm animate-[fadeIn_0.2s_ease-out] flex-col overflow-hidden rounded-3xl border border-gray-700/50 bg-white shadow-2xl dark:bg-[#1e2433]"
          role="dialog"
          aria-modal="true"
          aria-label={TEXT.aiValidator.overlayTitle}
        >
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30">
                  <Icon name="smart_toy" size="sm" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-[#1e2433] bg-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{headerTitle}</h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{headerHint}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white"
              aria-label={TEXT.common.close}
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 pt-4 pb-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-700/60 dark:bg-red-950/40">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-gray-400 uppercase">
                <span>{TEXT.aiValidator.suggestionLabel}</span>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-purple-400"
                  onClick={() => setShowSuggestion(prev => !prev)}
                >
                  {showSuggestion
                    ? TEXT.aiValidator.hideSuggestion
                    : TEXT.aiValidator.showSuggestion}
                </button>
              </div>
              {showSuggestion ? (
                <textarea
                  className="h-[160px] w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 focus:outline-none dark:border-gray-700 dark:bg-[#151b26] dark:text-gray-200 dark:placeholder-gray-500"
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                  placeholder={TEXT.aiValidator.suggestionLabel}
                />
              ) : (
                <div className="flex h-[160px] items-start rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-[#2a3449] dark:text-gray-200">
                  <p className="line-clamp-5 whitespace-pre-wrap">{draft}</p>
                </div>
              )}
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-gray-600 hover:text-white"
                    onClick={onClose}
                  >
                    {TEXT.common.cancel}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all hover:from-indigo-500 hover:to-purple-500 active:scale-95 disabled:opacity-60"
                    onClick={() => onCommit(draft)}
                    disabled={isCommitDisabled}
                  >
                    {TEXT.aiValidator.applySuggestion}
                  </button>
                </div>
              </div>
            </div>

            {isQuestionStage ? (
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex min-h-[54px] items-center justify-center rounded-2xl border border-dashed border-gray-200/70 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700/50 dark:bg-[#2a3449]">
                    <AILoadingState showQuote />
                  </div>
                ) : (
                  <div className="relative rounded-2xl rounded-tl-sm border border-gray-200/70 bg-gray-50 px-3.5 py-3 text-sm text-gray-700 dark:border-gray-700/50 dark:bg-[#2a3449] dark:text-gray-200">
                    <p className="whitespace-pre-wrap">{pendingQuestion}</p>
                    <div className="absolute -top-[1px] -left-2 h-3 w-3 rotate-45 border-t border-l border-gray-200/70 bg-gray-50 dark:border-gray-700/50 dark:bg-[#2a3449]" />
                  </div>
                )}
                <textarea
                  className="min-h-[120px] w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50 focus:outline-none disabled:opacity-60 dark:border-gray-700 dark:bg-[#151b26] dark:text-gray-200 dark:placeholder-gray-500"
                  value={answerDraft}
                  onChange={event => setAnswerDraft(event.target.value)}
                  placeholder={TEXT.aiValidator.chatInputPlaceholder}
                  disabled={isLoading}
                />
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all hover:from-indigo-500 hover:to-purple-500 active:scale-95 disabled:opacity-60"
                    onClick={() => {
                      if (!answerDraft.trim()) return
                      onSendAnswer?.(answerDraft.trim())
                      setAnswerDraft('')
                    }}
                    disabled={isLoading || !answerDraft.trim()}
                  >
                    <span>{TEXT.aiValidator.sendAnswer}</span>
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="min-h-[186px]" />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-5 py-4 dark:border-gray-800">
            {error && onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry}>
                {TEXT.aiValidator.retry}
              </Button>
            )}
            {isQuestionStage ? (
              <>
                {onFinalizeEarly && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white"
                    onClick={onFinalizeEarly}
                    disabled={isLoading}
                  >
                    <span className="material-symbols-outlined text-base text-purple-400">
                      auto_awesome
                    </span>
                    {TEXT.aiValidator.finishEarly}
                  </button>
                )}
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-white"
                  onClick={onClose}
                >
                  <span className="material-symbols-outlined text-base text-red-400">close</span>
                  {TEXT.common.cancel}
                </button>
              </>
            ) : null}
          </div>
          {isSuggestionStage && (
            <div className="px-5 pb-4 text-xs text-gray-500">{TEXT.aiValidator.commitHint}</div>
          )}
        </div>
      </div>
    </>
  )
}
