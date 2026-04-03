import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { Solver } from '~/pages/Solver'

afterEach(() => {
  cleanup()
})

describe('Solver', () => {
  it('should render the title', () => {
    render(<Solver />)
    expect(screen.getByText('Solver')).toBeDefined()
  })

  it('should render the coming soon message', () => {
    render(<Solver />)
    expect(screen.getByText('Coming soon')).toBeDefined()
  })
})
