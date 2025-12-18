'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Card } from '@/components/ui/atoms'
import CollapsibleSection from '@/features/negotiation/components/CollapsibleSection'
import { CopyPromptButton } from '@/features/negotiation/components/CopyPromptButton'
import { CopyRichButton } from '@/features/negotiation/components/CopyRichButton'
import { DownloadDocxButton } from '@/features/negotiation/components/DownloadDocxButton'
import { TEXT } from '@/lib/constants/text'

export interface GeneratedContentProps {
  emailContent?: string
  emailPrompt?: string
}

export function GeneratedContent({ emailContent, emailPrompt }: GeneratedContentProps) {
  const emailHtmlRef = useRef<HTMLDivElement>(null)
  const [showActions, setShowActions] = useState(false)

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
            <div className="flex flex-wrap items-center gap-2">
              {emailPrompt && (
                <button
                  type="button"
                  className="rounded-md border border-[var(--border-light)] bg-[var(--surface-light)] px-3 py-2 text-sm font-medium text-[var(--text-main)] shadow-sm transition-colors hover:bg-[var(--surface-subtle)]"
                  onClick={() => setShowActions(current => !current)}
                >
                  {showActions ? TEXT.negotiation.hideOptions : TEXT.negotiation.moreOptions}
                </button>
              )}
              {showActions && emailPrompt && (
                <CopyPromptButton content={emailPrompt} label={TEXT.negotiation.copyPrompt} />
              )}
              {showActions && (
                <>
                  <CopyRichButton
                    containerRef={emailHtmlRef as React.RefObject<HTMLDivElement>}
                    label={TEXT.negotiation.copyRich}
                  />
                  <DownloadDocxButton
                    content={emailContent}
                    filename="forhandling-epost.docx"
                    label={TEXT.negotiation.downloadDocx}
                  />
                </>
              )}
            </div>
          }
        >
          <Card variant="outlined" padding="none">
            <div
              className="email-content rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-8 text-base leading-relaxed text-[var(--text-main)] shadow-inner"
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
