import React from 'react'
import { Document, Packer } from 'docx'
import { markdownToDocxParagraphs } from '../utils/negotiationUtils'
import { Icon } from '@/components/ui/atoms'

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
      className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-purple-700 shadow-sm ring-1 ring-purple-200 transition-all ring-inset hover:bg-purple-50 hover:ring-purple-300"
      onClick={handleDownload}
      aria-label={label}
    >
      <Icon name="download" className="text-lg text-purple-500" />
      {label}
    </button>
  )
}
