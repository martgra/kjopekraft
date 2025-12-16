import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StatusBanner from '@/components/dashboard/StatusBanner'
import type { SalaryStatistics } from '@/domain/salary'

const createMockStatistics = (gapPercent: number): SalaryStatistics => ({
  startingPay: 400000,
  latestPay: 500000,
  inflationAdjustedPay: 480000,
  gapPercent,
  startingYear: 2020,
  latestYear: 2024,
})

describe('StatusBanner', () => {
  describe('Banner States', () => {
    it('shows strong win state when gap is >= 5%', () => {
      const statistics = createMockStatistics(7.5)
      render(<StatusBanner statistics={statistics} />)

      const container = screen.getByTestId('status-banner-container')
      expect(container).toHaveAttribute('data-state', 'strongWin')
      expect(screen.getByText('Du ligger foran inflasjonen')).toBeInTheDocument()
      expect(
        screen.getByText('Kjøpekraften din har økt. Du har fått mer å rutte med.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Se hva som har gjort forskjellen')).toBeInTheDocument()
    })

    it('shows small win state when gap is >= 1% and < 5%', () => {
      const statistics = createMockStatistics(2.3)
      render(<StatusBanner statistics={statistics} />)

      const container = screen.getByTestId('status-banner-container')
      expect(container).toHaveAttribute('data-state', 'smallWin')
      expect(screen.getByText('Du er så vidt foran – foreløpig')).toBeInTheDocument()
      expect(
        screen.getByText('Lønnen din har økt litt mer enn prisene. Dette kan raskt endre seg.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Sjekk forhandlingspotensialet ditt')).toBeInTheDocument()
    })

    it('shows losing state when gap is >= -3% and < 1%', () => {
      const statistics = createMockStatistics(-1.5)
      render(<StatusBanner statistics={statistics} />)

      const container = screen.getByTestId('status-banner-container')
      expect(container).toHaveAttribute('data-state', 'losing')
      expect(screen.getByText('Du taper kjøpekraft')).toBeInTheDocument()
      expect(
        screen.getByText('Prisene stiger raskere enn lønnen din. Du får mindre igjen for pengene.'),
      ).toBeInTheDocument()
      expect(screen.getByText('På tide å gjøre noe')).toBeInTheDocument()
    })

    it('shows losing badly state when gap is < -3%', () => {
      const statistics = createMockStatistics(-5.2)
      render(<StatusBanner statistics={statistics} />)

      const container = screen.getByTestId('status-banner-container')
      expect(container).toHaveAttribute('data-state', 'losingBadly')
      expect(screen.getByText('Kjøpekraften din faller')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Inflasjonen har tatt igjen inntekten din. Å stå stille betyr å gå bakover.',
        ),
      ).toBeInTheDocument()
      expect(screen.getByText('Forbered neste lønnssamtale')).toBeInTheDocument()
    })
  })

  describe('Micro-indicator', () => {
    it('displays positive gap with + sign', () => {
      const statistics = createMockStatistics(3.5)
      render(<StatusBanner statistics={statistics} />)

      expect(screen.getByText('+3.5 %')).toBeInTheDocument()
    })

    it('displays negative gap without + sign', () => {
      const statistics = createMockStatistics(-2.8)
      render(<StatusBanner statistics={statistics} />)

      expect(screen.getByText('-2.8 %')).toBeInTheDocument()
    })

    it('displays zero gap correctly', () => {
      const statistics = createMockStatistics(0)
      render(<StatusBanner statistics={statistics} />)

      expect(screen.getByText('0.0 %')).toBeInTheDocument()
    })
  })

  describe('CTA Button', () => {
    it('calls onCtaClick when CTA is clicked', async () => {
      const user = userEvent.setup()
      const onCtaClick = vi.fn()
      const statistics = createMockStatistics(3.5)

      render(<StatusBanner statistics={statistics} onCtaClick={onCtaClick} />)

      const ctaButton = screen.getByTestId('status-banner-cta')
      await user.click(ctaButton)

      expect(onCtaClick).toHaveBeenCalledOnce()
    })

    it('does not error when CTA is clicked without handler', async () => {
      const user = userEvent.setup()
      const statistics = createMockStatistics(3.5)

      render(<StatusBanner statistics={statistics} />)

      const ctaButton = screen.getByTestId('status-banner-cta')
      await user.click(ctaButton)

      // Should not throw
    })
  })

  describe('Edge Cases', () => {
    it('handles exact boundary at 5%', () => {
      const statistics = createMockStatistics(5.0)
      render(<StatusBanner statistics={statistics} />)

      const container = screen.getByTestId('status-banner-container')
      expect(container).toHaveAttribute('data-state', 'strongWin')
    })

    it('handles exact boundary at 1%', () => {
      const statistics = createMockStatistics(1.0)
      render(<StatusBanner statistics={statistics} />)

      const container = screen.getByTestId('status-banner-container')
      expect(container).toHaveAttribute('data-state', 'smallWin')
    })

    it('handles exact boundary at -3%', () => {
      const statistics = createMockStatistics(-3.0)
      render(<StatusBanner statistics={statistics} />)

      const container = screen.getByTestId('status-banner-container')
      expect(container).toHaveAttribute('data-state', 'losing')
    })
  })
})
