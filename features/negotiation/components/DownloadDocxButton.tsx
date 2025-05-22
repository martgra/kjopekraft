import React from 'react'
import { Document, Packer } from 'docx'
import { markdownToDocxParagraphs } from '../utils/negotiationUtils'

interface DownloadDocxButtonProps {
  content: string
  filename: string
  label: string
}

export function DownloadDocxButton({ content, filename, label }: DownloadDocxButtonProps) {
  async function handleDownload() {
    const paragraphs = markdownToDocxParagraphs(content)
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    })
    const blob = await Packer.toBlob(doc)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  return (
    <button
      type="button"
      className="ml-2 flex items-center gap-1 rounded border border-purple-300 bg-purple-50 px-2 py-1 text-xs text-purple-700 transition-colors hover:bg-purple-100 focus:ring-2 focus:ring-purple-400 focus:outline-none"
      onClick={handleDownload}
      aria-label={label}
    >
      <span>⬇️</span>
      {label}
    </button>
  )
}
