/// <reference types="vitest" />

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OnboardingEmptyState from '@/features/onboarding/OnboardingEmptyState'
import { TEXT } from '@/lib/constants/text'

describe('OnboardingEmptyState', () => {
  const originalWidth = window.innerWidth

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 })
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalWidth,
    })
  })

  it('invokes load demo handler', async () => {
    const user = userEvent.setup()
    const onLoadDemo = vi.fn()
    const onOpenDrawer = vi.fn()

    render(<OnboardingEmptyState onLoadDemo={onLoadDemo} onOpenDrawer={onOpenDrawer} />)

    await user.click(screen.getByRole('button', { name: new RegExp(TEXT.onboarding.loadDemoLink) }))
    expect(onLoadDemo).toHaveBeenCalledTimes(1)
    expect(onOpenDrawer).not.toHaveBeenCalled()
  })

  it('opens drawer on mobile width and does not scroll', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 })
    window.scrollTo = vi.fn()
    const onLoadDemo = vi.fn()
    const onOpenDrawer = vi.fn()

    render(<OnboardingEmptyState onLoadDemo={onLoadDemo} onOpenDrawer={onOpenDrawer} />)

    await user.click(screen.getByRole('button', { name: new RegExp(TEXT.onboarding.primaryCta) }))
    expect(onOpenDrawer).toHaveBeenCalledTimes(1)
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls to top on desktop when adding own data', async () => {
    const user = userEvent.setup()
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    const onLoadDemo = vi.fn()
    const onOpenDrawer = vi.fn()
    window.scrollTo = vi.fn()

    render(<OnboardingEmptyState onLoadDemo={onLoadDemo} onOpenDrawer={onOpenDrawer} />)

    await user.click(screen.getByRole('button', { name: new RegExp(TEXT.onboarding.primaryCta) }))
    expect(onOpenDrawer).not.toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
