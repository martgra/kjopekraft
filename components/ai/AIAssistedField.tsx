'use client'

import { useEffect, useRef, useState } from 'react'
import { AILoadingState, AIButton, Button, Icon } from '@/components/ui/atoms'
import { TEXT } from '@/lib/constants/text'
import { useAiTextValidator } from '@/features/aiTextValidator/useAiTextValidator'
import type { AiTextCompletionModel } from '@/lib/ai/models'

interface AIAssistedFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  pointType?: string
  language?: string
  maxChars?: number
  endpoint?: string
  systemPrompt?: string
  model?: AiTextCompletionModel
  disabled?: boolean
  resetSignal?: number
}

export function AIAssistedField({
  value,
  onChange,
  placeholder = '',
  pointType,
  language = 'norsk',
  maxChars,
  endpoint,
  systemPrompt,
  model,
  disabled = false,
  resetSignal = 0,
}: AIAssistedFieldProps) {
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiActive, setAiActive] = useState(false)
  const [hasAiUpdate, setHasAiUpdate] = useState(false)
  const previousManualValueRef = useRef(value)
  const validator = useAiTextValidator({
    trigger: 'manual',
    language,
    maxChars,
    endpoint,
    systemPrompt,
    model,
    onCommit: nextValue => {
      if (!nextValue.trim()) return
      onChange(nextValue.trim())
    },
  })

  const {
    suggestion,
    pendingQuestion,
    status,
    isLoading,
    error,
    canValidate,
    startValidation,
    answerQuestion,
    reset,
  } = validator

  const trimmedSuggestion = suggestion.trim()
  const trimmedAnswer = aiAnswer.trim()
  const isDone = status === 'done'
  const showPanel =
    (aiActive || pendingQuestion || isLoading || isDone) &&
    !(!isLoading && isDone && !pendingQuestion)

  useEffect(() => {
    if (!aiActive) return
    if (trimmedSuggestion) {
      const nextValue = trimmedSuggestion
      setHasAiUpdate(true)
      onChange(nextValue)
    }
  }, [aiActive, onChange, trimmedSuggestion])

  useEffect(() => {
    if (!aiActive) {
      previousManualValueRef.current = value
    }
  }, [aiActive, value])

  const handleImprove = () => {
    previousManualValueRef.current = value
    setAiActive(true)
    startValidation(value, { pointType })
  }

  const handleSendAnswer = async () => {
    if (!trimmedAnswer) return
    setAiActive(true)
    await answerQuestion(trimmedAnswer)
    setAiAnswer('')
  }

  const handleRevert = () => {
    setHasAiUpdate(false)
    setAiActive(false)
    reset()
    onChange(previousManualValueRef.current)
  }

  useEffect(() => {
    setAiActive(false)
    setAiAnswer('')
    setHasAiUpdate(false)
    reset()
  }, [resetSignal, reset])

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] w-full resize-y rounded-xl border border-[var(--border-light)] bg-[var(--surface-subtle)] px-3 py-2 pr-20 text-base text-[var(--text-main)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
          disabled={disabled}
        />
        {hasAiUpdate && !disabled ? (
          <div className="absolute right-2 bottom-2 flex items-center">
            <button
              type="button"
              className="rounded-full border border-[color:var(--border-light)]/60 bg-[color:var(--surface-light)]/80 p-1.5 text-[var(--text-muted)] shadow-sm backdrop-blur transition-all hover:border-[var(--primary)]/40 hover:text-[var(--text-main)] hover:shadow-md"
              onClick={handleRevert}
              aria-label={TEXT.common.reset}
              title={TEXT.common.reset}
            >
              <Icon name="undo" size="sm" />
            </button>
          </div>
        ) : null}
      </div>
      <AIButton
        label={TEXT.aiValidator.improveButton}
        onClick={handleImprove}
        disabled={disabled || !canValidate(value)}
      />
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}
      {showPanel && (
        <div className="space-y-3 rounded-xl border border-[var(--border-light)] bg-[var(--surface-subtle)] p-3">
          {isLoading ? (
            <div className="text-xs text-[var(--text-muted)]">
              <AILoadingState showQuote />
            </div>
          ) : pendingQuestion ? (
            <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2 text-sm text-[var(--text-main)]">
              {pendingQuestion}
            </div>
          ) : isDone ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-200">
              {TEXT.aiValidator.aiSatisfied}
            </div>
          ) : (
            <div className="rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2 text-xs text-[var(--text-muted)]">
              {TEXT.aiValidator.inlineHint}
            </div>
          )}
          <textarea
            className="min-h-[96px] w-full resize-none rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none"
            value={aiAnswer}
            onChange={event => setAiAnswer(event.target.value)}
            placeholder={TEXT.aiValidator.chatInputPlaceholder}
            disabled={isLoading || !pendingQuestion}
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              size="sm"
              onClick={handleSendAnswer}
              disabled={!trimmedAnswer || !pendingQuestion || isLoading}
            >
              {TEXT.aiValidator.sendAnswer}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
