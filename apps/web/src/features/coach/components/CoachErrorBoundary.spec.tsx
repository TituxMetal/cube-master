import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'

import { CoachErrorBoundary } from '~/features/coach/components/CoachErrorBoundary'
import { $lessonStepIndex, goToStep, startLesson } from '~/features/coach/stores/coachStore'

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

  it('should re-home the lesson to step 0 on Réessayer so the retry lands on a renderable step', async () => {
    const user = userEvent.setup()
    // A throw always comes from the current step's recipe; without stepping back, the
    // retry rerenders the same step and rethrows. Put the learner deep in a chapter,
    // then assert pressing Réessayer moves them to step 0 (the boundary's onReset).
    startLesson('white-cross')
    goToStep(2)
    expect($lessonStepIndex.get()).toBe(2)

    render(
      <CoachErrorBoundary resetKey='white-cross'>
        <Boom />
      </CoachErrorBoundary>
    )
    await user.click(screen.getByRole('button', { name: 'Réessayer' }))

    expect($lessonStepIndex.get()).toBe(0)
  })
})
