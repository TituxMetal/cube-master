import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { ColorPalette } from '~/features/solver/components/ColorPalette'

afterEach(() => {
  cleanup()
})

describe('ColorPalette', () => {
  it('should render 6 color swatches', () => {
    render(<ColorPalette />)

    expect(screen.getByLabelText('white')).toBeDefined()
    expect(screen.getByLabelText('yellow')).toBeDefined()
    expect(screen.getByLabelText('red')).toBeDefined()
    expect(screen.getByLabelText('orange')).toBeDefined()
    expect(screen.getByLabelText('blue')).toBeDefined()
    expect(screen.getByLabelText('green')).toBeDefined()
  })

  it('should show cycle arrows between colors', () => {
    const { container } = render(<ColorPalette />)

    const arrows = container.querySelectorAll('[aria-hidden="true"]')
    expect(arrows).toHaveLength(6)
  })
})
