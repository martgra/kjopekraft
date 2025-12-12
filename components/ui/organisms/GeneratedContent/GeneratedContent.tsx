'use client'

import { useRef } from 'react'
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
  playbookContent?: string
  playbookPrompt?: string
}

export function GeneratedContent({
  emailContent,
  emailPrompt,
  playbookContent,
  playbookPrompt,
}: GeneratedContentProps) {
  const emailHtmlRef = useRef<HTMLDivElement>(null)
  const playbookHtmlRef = useRef<HTMLDivElement>(null)

  if (!emailContent && !playbookContent) return null

  return (
    <div className="space-y-4">
      {/* Email Content */}
      {emailContent && emailPrompt && (
        <CollapsibleSection
          title={TEXT.negotiation.emailSectionTitle}
          collapseLabel={TEXT.negotiation.collapseEmail}
          defaultCollapsed={false}
          icon="mail_outline"
          actions={
            <>
              <CopyPromptButton content={emailPrompt} label={TEXT.negotiation.copyPrompt} />
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
          }
        >
          <Card variant="outlined" padding="none">
            <div
              className="email-content rounded-lg border border-[var(--border-light)] bg-white p-8 text-base leading-relaxed text-gray-800 shadow-inner"
              ref={emailHtmlRef}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {emailContent}
              </ReactMarkdown>
            </div>
          </Card>
        </CollapsibleSection>
      )}

      {/* Playbook Content */}
      {playbookContent && playbookPrompt && (
        <CollapsibleSection
          title={TEXT.negotiation.playbookSectionTitle}
          collapseLabel={TEXT.negotiation.collapsePlaybook}
          defaultCollapsed={false}
          icon="menu_book"
          actions={
            <>
              <CopyPromptButton content={playbookPrompt} label={TEXT.negotiation.copyPrompt} />
              <CopyRichButton
                containerRef={playbookHtmlRef as React.RefObject<HTMLDivElement>}
                label={TEXT.negotiation.copyRich}
              />
              <DownloadDocxButton
                content={playbookContent}
                filename="forhandling-spillbok.docx"
                label={TEXT.negotiation.downloadDocx}
              />
            </>
          }
        >
          <Card variant="outlined" padding="none">
            <div
              className="playbook-content rounded-lg border border-[var(--border-light)] bg-white p-8 text-base leading-relaxed text-gray-800 shadow-inner"
              ref={playbookHtmlRef}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {playbookContent}
              </ReactMarkdown>
            </div>
          </Card>
        </CollapsibleSection>
      )}
    </div>
  )
}
