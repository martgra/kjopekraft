'use client'

import { TEXT } from '@/lib/constants/text'
import { createTestId } from '@/lib/testing/testIds'
import { useTheme } from '@/contexts/theme/ThemeContext'

export function ThemeToggle() {
  const testId = createTestId('theme-toggle')
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div
      className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 dark:border-gray-700"
      data-testid={testId('container')}
    >
      <div>
        <div className="text-sm font-semibold text-[var(--text-main)]">
          {TEXT.settings.themeToggleTitle}
        </div>
        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
          {TEXT.settings.themeToggleSubtitle}
        </div>
      </div>
      <input
        type="checkbox"
        checked={isDarkMode}
        onChange={toggleTheme}
        className="relative h-6 w-11 cursor-pointer appearance-none rounded-full bg-gray-200 transition before:absolute before:top-0.5 before:left-0.5 before:h-5 before:w-5 before:rounded-full before:bg-white before:shadow before:transition before:content-[''] checked:bg-[var(--primary)] checked:before:translate-x-5 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 dark:bg-gray-700 dark:before:bg-gray-300"
        aria-label={TEXT.settings.themeToggleTitle}
        data-testid={testId('toggle')}
      />
    </div>
  )
}
