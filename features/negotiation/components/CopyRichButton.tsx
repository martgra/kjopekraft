import React, { useState, RefObject } from 'react'
import { Icon } from '@/components/ui/atoms'

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
      className="text-primary inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-blue-200 transition-all ring-inset hover:bg-blue-50 hover:ring-blue-300"
      onClick={handleCopy}
      aria-label={label}
    >
      <Icon name="edit_note" className="text-primary text-lg" />
      {copied === true ? label + ' ✓' : copied === false ? label + ' ✗' : label}
    </button>
  )
}
