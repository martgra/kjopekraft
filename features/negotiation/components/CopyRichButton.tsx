import React, { useState, RefObject } from 'react'

interface CopyRichButtonProps {
  containerRef: RefObject<HTMLDivElement>
  label: string
}

export function CopyRichButton({ containerRef, label }: CopyRichButtonProps) {
  const [copied, setCopied] = useState<null | boolean>(null)
  async function handleCopy() {
    try {
      if (containerRef.current) {
        const html = containerRef.current.innerHTML
        await navigator.clipboard.write([
          new window.ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([containerRef.current.innerText], { type: 'text/plain' }),
          }),
        ])
        setCopied(true)
      } else {
        setCopied(false)
      }
    } catch {
      setCopied(false)
    } finally {
      setTimeout(() => setCopied(null), 1500)
    }
  }
  return (
    <button
      type="button"
      className="ml-2 flex items-center gap-1 rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      onClick={handleCopy}
      aria-label={label}
    >
      <span>📝</span>
      {copied === true ? label + ' ✓' : copied === false ? label + ' ✗' : label}
    </button>
  )
}
