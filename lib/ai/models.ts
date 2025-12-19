export const AI_TEXT_COMPLETION_MODELS = [
  'gpt-5.2-pro',
  'gpt-5.2-chat-latest',
  'gpt-5.2',
  'gpt-5.1-codex-mini',
  'gpt-5.1-codex',
  'gpt-5.1-chat-latest',
  'gpt-5.1',
  'gpt-5-pro',
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-5-codex',
  'gpt-5-chat-latest',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4.1-nano',
  'gpt-4o',
  'gpt-4o-mini',
] as const

export type AiTextCompletionModel = (typeof AI_TEXT_COMPLETION_MODELS)[number]
