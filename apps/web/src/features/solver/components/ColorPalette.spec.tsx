import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { ColorPalette } from '~/features/solver/components/ColorPalette'

afterEach(() => {
  cleanup()
})

describe('ColorPalette', () => {
  it('should render 6 color swatches', () => {
    render(<ColorPalette selectedColor='Wt' onSelectColor={() => {}} />)

    expect(screen.getAllByRole('button')).toHaveLength(6)
  })

  it('should have aria-labels for each color', () => {
    render(<ColorPalette selectedColor='Wt' onSelectColor={() => {}} />)

    expect(screen.getByLabelText('Select white')).toBeDefined()
    expect(screen.getByLabelText('Select yellow')).toBeDefined()
    expect(screen.getByLabelText('Select red')).toBeDefined()
    expect(screen.getByLabelText('Select orange')).toBeDefined()
    expect(screen.getByLabelText('Select blue')).toBeDefined()
    expect(screen.getByLabelText('Select green')).toBeDefined()
  })

  it('should mark selected color as pressed', () => {
    render(<ColorPalette selectedColor='Rd' onSelectColor={() => {}} />)

    expect(screen.getByLabelText('Select red').getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByLabelText('Select white').getAttribute('aria-pressed')).toBe('false')
  })

  it('should call onSelectColor when clicking a swatch', async () => {
    const user = userEvent.setup()
    const onSelectColor = mock(() => {})

    render(<ColorPalette selectedColor='Wt' onSelectColor={onSelectColor} />)

    await user.click(screen.getByLabelText('Select blue'))

    expect(onSelectColor).toHaveBeenCalledTimes(1)
    expect(onSelectColor).toHaveBeenCalledWith('Bl')
  })
})
