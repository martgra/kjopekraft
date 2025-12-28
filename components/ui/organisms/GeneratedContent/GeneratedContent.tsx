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

interface GeneratedContentProps {
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
              className="email-content overflow-x-auto rounded-lg border border-[var(--border-light)] bg-[var(--surface-light)] p-6 text-base leading-relaxed text-[var(--text-main)] shadow-sm sm:p-10"
              ref={emailHtmlRef}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Ensure proper rendering of markdown elements
                  p: ({ children, ...props }) => <p {...props}>{children}</p>,
                  ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
                  ol: ({ children, ...props }) => <ol {...props}>{children}</ol>,
                  li: ({ children, ...props }) => <li {...props}>{children}</li>,
                  strong: ({ children, ...props }) => <strong {...props}>{children}</strong>,
                  em: ({ children, ...props }) => <em {...props}>{children}</em>,
                  a: ({ children, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
                  h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
                  h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
                  h4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
                }}
              >
                {emailContent}
              </ReactMarkdown>
            </div>
          </Card>
        </CollapsibleSection>
      )}
    </div>
  )
}
