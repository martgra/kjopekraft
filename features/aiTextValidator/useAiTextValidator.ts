'use client'

import { useCallback, useMemo, useState } from 'react'
import { TEXT } from '@/lib/constants/text'

type TriggerMode = 'blur' | 'submit' | 'manual'
type TriggerConfig = TriggerMode | TriggerMode[]

interface ValidationContext {
  pointType?: string
}

type ChatMessage = { role: 'assistant' | 'user'; content: string }

type ValidationResponse =
  | { status: 'question'; question: string; improvedText: string }
  | { status: 'done'; improvedText: string }

export interface UseAiTextValidatorOptions {
  endpoint?: string
  enabled?: boolean
  trigger?: TriggerConfig
  maxChars?: number
  language?: string
  systemPrompt?: string
  model?: string
  onCommit?: (value: string) => void
}

export interface UseAiTextValidatorResult {
  suggestion: string
  messages: ChatMessage[]
  pendingQuestion: string | null
  status: ValidationResponse['status'] | null
  isOpen: boolean
  isLoading: boolean
  error: string | null
  canValidate: (text: string) => boolean
  startValidation: (text: string, context?: ValidationContext) => Promise<void>
  answerQuestion: (answer: string) => Promise<void>
  finalizeEarly: () => Promise<ValidationResponse | null>
  handleTrigger: (mode: TriggerMode, text: string, context?: ValidationContext) => void
  openOverlay: () => void
  closeOverlay: () => void
  commitSuggestion: (value: string) => void
  reset: () => void
}

function normalizeTriggerConfig(trigger?: TriggerConfig) {
  if (!trigger) return new Set<TriggerMode>(['manual'])
  return new Set(Array.isArray(trigger) ? trigger : [trigger])
}

export function useAiTextValidator({
  endpoint = '/api/ai/validate-text',
  enabled = true,
  trigger = 'manual',
  maxChars,
  language,
  systemPrompt,
  model,
  onCommit,
}: UseAiTextValidatorOptions = {}): UseAiTextValidatorResult {
  const [suggestion, setSuggestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)
  const [status, setStatus] = useState<ValidationResponse['status'] | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentText, setCurrentText] = useState('')
  const [currentContext, setCurrentContext] = useState<ValidationContext | null>(null)
  const triggerModes = useMemo(() => normalizeTriggerConfig(trigger), [trigger])

  const canValidate = useCallback(
    (text: string) => {
      if (!enabled) return false
      if (!text.trim()) return false
      if (typeof maxChars === 'number' && text.length > maxChars) return false
      return true
    },
    [enabled, maxChars],
  )

  const requestValidation = useCallback(
    async (
      text: string,
      context: ValidationContext | null,
      history: ChatMessage[],
      forceFinalize?: boolean,
    ) => {
      if (!enabled) return null

      if (!text.trim()) {
        setError(TEXT.aiValidator.emptyText)
        setIsOpen(true)
        return
      }

      if (typeof maxChars === 'number' && text.length > maxChars) {
        setError(TEXT.aiValidator.tooLong(maxChars))
        setIsOpen(true)
        return
      }

      setIsOpen(true)
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language,
            maxChars,
            systemPrompt,
            model,
            pointType: context?.pointType,
            history,
            forceFinalize,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || data.details || TEXT.aiValidator.errorTitle)
        }
        const result = data as ValidationResponse
        setStatus(result.status)
        if (result.status === 'question' && !forceFinalize) {
          setPendingQuestion(result.question)
          setMessages(prev => [...prev, { role: 'assistant', content: result.question }])
        } else {
          setPendingQuestion(null)
        }
        setSuggestion(result.improvedText ?? '')
        return result
      } catch (err) {
        console.error('AI text validation error:', err)
        setError(TEXT.aiValidator.errorTitle)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [enabled, endpoint, language, maxChars, systemPrompt],
  )

  const startValidation = useCallback(
    async (text: string, context?: ValidationContext) => {
      setMessages([])
      setPendingQuestion(null)
      setStatus(null)
      setCurrentText(text)
      setCurrentContext(context ?? null)
      await requestValidation(text, context ?? null, [])
    },
    [requestValidation],
  )

  const answerQuestion = useCallback(
    async (answer: string) => {
      if (!pendingQuestion) return
      const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: answer }]
      setMessages(nextMessages)
      await requestValidation(currentText, currentContext, nextMessages)
    },
    [currentContext, currentText, messages, pendingQuestion, requestValidation],
  )

  const finalizeEarly = useCallback(async () => {
    return (await requestValidation(currentText, currentContext, messages, true)) ?? null
  }, [currentContext, currentText, messages, requestValidation])

  const handleTrigger = useCallback(
    (mode: TriggerMode, text: string, context?: ValidationContext) => {
      if (triggerModes.has(mode)) {
        void startValidation(text, context)
      }
    },
    [startValidation, triggerModes],
  )

  const openOverlay = useCallback(() => setIsOpen(true), [])
  const closeOverlay = useCallback(() => setIsOpen(false), [])

  const commitSuggestion = useCallback(
    (value: string) => {
      onCommit?.(value)
      setIsOpen(false)
    },
    [onCommit],
  )

  const reset = useCallback(() => {
    setPendingQuestion(null)
    setMessages([])
    setStatus(null)
    setIsLoading(false)
    setError(null)
  }, [])

  return {
    suggestion,
    messages,
    pendingQuestion,
    status,
    isOpen,
    isLoading,
    error,
    canValidate,
    startValidation,
    answerQuestion,
    finalizeEarly,
    handleTrigger,
    openOverlay,
    closeOverlay,
    commitSuggestion,
    reset,
  }
}
