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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('salary-onboarding-v1')
      }
    }
  }

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white px-4 pt-6 pb-4 text-xs text-neutral-600">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center space-x-4">
          <Link
            href="https://github.com/martgra/kjopekraft/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 flex items-center gap-1.5 text-neutral-600 transition"
          >
            <FaFileAlt className="text-sm" />
            <span>{TEXT.footer.license}</span>
          </Link>

          <Link
            href={`https://github.com/martgra/kjopekraft/issues/new?template=bug_report.md&labels=bug&assignees=martgra`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary-600 flex items-center gap-1.5 text-neutral-600 transition"
            aria-label={TEXT.footer.reportIssue}
          >
            <FaGithub className="text-sm" />
            <span>{TEXT.footer.reportIssue}</span>
          </Link>
        </div>

        <button
          onClick={handleReset}
          className="hover:text-danger-600 flex items-center gap-1.5 text-neutral-600 transition"
          title={TEXT.common.reset}
        >
          <span>{TEXT.common.reset}</span>
        </button>
      </div>
    </footer>
  )
}
