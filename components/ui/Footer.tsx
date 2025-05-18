'use client'

import Link from 'next/link'
import { FaGithub, FaFileAlt } from 'react-icons/fa'
import { TEXT } from '@/lib/constants/text'
import { useOnboarding } from '@/hooks/useOnboarding'

export default function Footer() {
  const { reset } = useOnboarding()

  const handleReset = () => {
    if (window.confirm(TEXT.common.confirmReset)) {
      reset()
    }
  }

  return (
    <footer className="mt-auto border-t border-gray-100 px-4 pt-6 pb-4 text-xs text-gray-500">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <Link
            href="https://github.com/martgra/kjopekraft/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 transition hover:text-gray-700"
          >
            <FaFileAlt className="text-base" />
            <span>{TEXT.footer.license}</span>
          </Link>

          <Link
            href={`https://github.com/martgra/kjopekraft/issues/new?template=bug_report.md&labels=bug&assignees=martgra`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gray-500 transition hover:text-gray-700"
            aria-label={TEXT.footer.reportIssue}
          >
            <FaGithub className="text-base" />
            <span>{TEXT.footer.reportIssue}</span>
          </Link>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-gray-500 transition hover:text-gray-700"
          title={TEXT.common.reset}
        >
          <span>{TEXT.common.reset}</span>
        </button>
      </div>
    </footer>
  )
}
