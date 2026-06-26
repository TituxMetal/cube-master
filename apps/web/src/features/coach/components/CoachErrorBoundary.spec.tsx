import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'

import { CoachErrorBoundary } from '~/features/coach/components/CoachErrorBoundary'

// React logs caught render errors to console.error; silence it so the boundary's
// expected throws don't clutter the test output.
let errorSpy: ReturnType<typeof spyOn>
beforeEach(() => {
  errorSpy = spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  errorSpy.mockRestore()
  cleanup()
})

const Boom = (): never => {
  throw new Error('planner regression')
}

describe('CoachErrorBoundary', () => {
  it('should render the recovery fallback when a child throws, not a blank screen', () => {
    render(
      <CoachErrorBoundary resetKey='white-cross'>
        <Boom />
      </CoachErrorBoundary>
    )
    expect(screen.getByRole('heading', { name: 'Une erreur est survenue' })).toBeDefined()
    expect(screen.getByRole('link', { name: 'Retour au Coach' })).toBeDefined()
  })

  it('should render its children untouched when they do not throw', () => {
    render(
      <CoachErrorBoundary resetKey='white-cross'>
        <p>chapitre ok</p>
      </CoachErrorBoundary>
    )
    expect(screen.getByText('chapitre ok')).toBeDefined()
  })

  it('should reset on lesson change so navigating away clears a stuck error', () => {
    const { rerender } = render(
      <CoachErrorBoundary resetKey='white-cross'>
        <Boom />
      </CoachErrorBoundary>
    )
    expect(screen.getByRole('heading', { name: 'Une erreur est survenue' })).toBeDefined()

    rerender(
      <CoachErrorBoundary resetKey='coach-home'>
        <p>chapitre ok</p>
      </CoachErrorBoundary>
    )
    expect(screen.getByText('chapitre ok')).toBeDefined()
  })
})
