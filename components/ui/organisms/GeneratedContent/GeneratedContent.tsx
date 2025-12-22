'use client'

import { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Card } from '@/components/ui/atoms'
import CollapsibleSection from '@/features/negotiation/components/CollapsibleSection'
import { CopyRichButton } from '@/features/negotiation/components/CopyRichButton'
import { DownloadDocxButton } from '@/features/negotiation/components/DownloadDocxButton'
import { TEXT } from '@/lib/constants/text'

export interface GeneratedContentProps {
  emailContent?: string
}

export function GeneratedContent({ emailContent }: GeneratedContentProps) {
  const emailHtmlRef = useRef<HTMLDivElement>(null)

  return (
    <div className="space-y-4">
      {/* Email Content */}
      {emailContent && (
        <CollapsibleSection
          title={TEXT.negotiation.emailSectionTitle}
          collapseLabel={TEXT.negotiation.collapseEmail}
          defaultCollapsed={false}
          icon="mail_outline"
          actions={
            <div className="flex items-center gap-2">
              <CopyRichButton
                containerRef={emailHtmlRef as React.RefObject<HTMLDivElement>}
                label={TEXT.negotiation.copyRich}
              />
              <DownloadDocxButton
                content={emailContent}
                filename="forhandling-epost.docx"
                label={TEXT.negotiation.downloadDocx}
              />
            </div>
          }
        >
          <Card variant="outlined" padding="none">
            <div
              className="email-content overflow-x-auto rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-4 text-base leading-relaxed text-[var(--text-main)] shadow-inner sm:p-8"
              ref={emailHtmlRef}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {emailContent}
              </ReactMarkdown>
            </div>
          </Card>
        </CollapsibleSection>
      )}
    </div>
  )
}
