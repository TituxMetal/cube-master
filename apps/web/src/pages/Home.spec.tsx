import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { resetAction } from '~/features/cube/stores/cube-store'
import { Home } from '~/pages/Home'

beforeEach(() => {
  window.history.pushState(null, '', '/')
  resetAction()
})

afterEach(() => {
  cleanup()
})

describe('Home', () => {
  it('should render three mode cards', () => {
    render(<Home />)
    expect(screen.getByText('Solver')).toBeDefined()
    expect(screen.getByText('Coach')).toBeDefined()
    expect(screen.getByText('Timer')).toBeDefined()
  })

  it('should render card descriptions', () => {
    render(<Home />)
    expect(screen.getByText(/optimal solution/)).toBeDefined()
    expect(screen.getByText(/solving skills/)).toBeDefined()
    expect(screen.getByText(/solve times/)).toBeDefined()
  })

  it('should render cards with correct links', () => {
    render(<Home />)
    const solverLink = screen.getByText('Solver').closest('a')
    const coachLink = screen.getByText('Coach').closest('a')
    const timerLink = screen.getByText('Timer').closest('a')

    expect(solverLink?.getAttribute('href')).toBe('/solver')
    expect(coachLink?.getAttribute('href')).toBe('/coach')
    expect(timerLink?.getAttribute('href')).toBe('/timer')
  })

  it('should render the interactive cube', () => {
    render(<Home />)
    expect(screen.getByLabelText('Interactive cube')).toBeDefined()
  })
})
