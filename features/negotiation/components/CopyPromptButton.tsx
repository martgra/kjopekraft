import React, { useState } from 'react'
import { Icon } from '@/components/ui/atoms'

interface CopyPromptButtonProps {
  content: string
  label: string
}

export function CopyPromptButton({ content, label }: CopyPromptButtonProps) {
  const [copied, setCopied] = useState<null | boolean>(null)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      setCopied(false)
      setTimeout(() => setCopied(null), 1500)
    }
  }
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--surface-light)] px-3 py-2 text-sm font-medium text-[var(--text-main)] shadow-sm ring-1 ring-[var(--border-light)] transition-all ring-inset hover:bg-[var(--surface-subtle)]"
      onClick={handleCopy}
      aria-label={label}
    >
      <Icon name="content_copy" className="text-lg text-[var(--text-muted)]" />
      {copied === true ? label + ' ✓' : copied === false ? label + ' ✗' : label}
    </button>
  )
}
