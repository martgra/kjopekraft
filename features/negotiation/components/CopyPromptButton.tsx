import React, { useState } from 'react'

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
      className="ml-auto flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      onClick={handleCopy}
      aria-label={label}
    >
      <span>📋</span>
      {copied === true ? label + ' ✓' : copied === false ? label + ' ✗' : label}
    </button>
  )
}
