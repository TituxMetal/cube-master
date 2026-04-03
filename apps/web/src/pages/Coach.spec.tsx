import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { Coach } from '~/pages/Coach'

afterEach(() => {
  cleanup()
})

describe('Coach', () => {
  it('should render the title', () => {
    render(<Coach />)
    expect(screen.getByText('Coach')).toBeDefined()
  })

  it('should render the coming soon message', () => {
    render(<Coach />)
    expect(screen.getByText('Coming soon')).toBeDefined()
  })
})
