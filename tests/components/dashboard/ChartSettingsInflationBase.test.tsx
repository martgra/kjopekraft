import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChartSettingsInflationBase } from '@/components/dashboard/ChartSettingsInflationBase'

describe('ChartSettingsInflationBase', () => {
  it('changes the selected base year', () => {
    const onChange = vi.fn()
    render(
      <ChartSettingsInflationBase
        value="auto"
        options={[
          { value: 'auto', label: 'Auto' },
          { value: '2022', label: '2022' },
        ]}
        onChange={onChange}
      />,
    )

    const input = screen.getByTestId('chart-settings-inflation-base-select')
    fireEvent.change(input, { target: { value: '2022' } })
    expect(onChange).toHaveBeenCalledWith('2022')
  })
})
