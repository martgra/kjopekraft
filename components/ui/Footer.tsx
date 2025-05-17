'use client'

import Link from 'next/link'
import { FaGithub, FaFileAlt } from 'react-icons/fa'
import { TEXT } from '@/lib/constants/text'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 px-4 pt-6 pb-4 text-xs text-gray-500">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="text-left">
          <Link
            href="https://github.com/martgra/kjopekraft/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 transition hover:text-gray-700"
          >
            <FaFileAlt className="text-base" />
            <span>{TEXT.footer.license}</span>
          </Link>
        </div>
        <div>
          <Link
            href={
              // 1. /issues/new instead of /issues
              // 2. template=… must match your .github/ISSUE_TEMPLATE/bug_report.md filename
              // 3. title, body, labels & assignees are all optional and URL-encoded
              `https://github.com/martgra/kjopekraft/issues/new
                ?template=bug_report.md
                &labels=bug
                &assignees=martgra`.replace(/\s+/g, '') // strip the whitespace/newlines
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 transition hover:text-gray-700"
            aria-label={TEXT.footer.reportIssue}
          >
            <FaGithub className="text-base" />
            <span>{TEXT.footer.reportIssue}</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}
