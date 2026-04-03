import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { Timer } from '~/pages/Timer'

afterEach(() => {
  cleanup()
})

describe('Timer', () => {
  it('should render the title', () => {
    render(<Timer />)
    expect(screen.getByText('Timer')).toBeDefined()
  })

  it('should render the coming soon message', () => {
    render(<Timer />)
    expect(screen.getByText('Coming soon')).toBeDefined()
  })
})
