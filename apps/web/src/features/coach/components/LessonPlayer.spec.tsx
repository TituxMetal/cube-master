import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { LessonPlayer } from '~/features/coach/components/LessonPlayer'
import { $progress } from '~/features/coach/stores/coachStore'

beforeEach(() => {
  localStorage.clear()
  $progress.set({ completedLessons: [], current: { lesson: null, step: 0 } })
})

afterEach(() => {
  cleanup()
})

describe('LessonPlayer', () => {
  it('should render the Second Layer chapter and its first step', () => {
    render(<LessonPlayer lessonId='second-layer' />)
    expect(screen.getByText('Second Layer')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Meet the middle layer' })).toBeDefined()
    expect(screen.getByText('Send an edge to the right')).toBeDefined()
  })

  it('should advance demo frames with the reused step controls', async () => {
    const user = userEvent.setup()
    render(<LessonPlayer lessonId='second-layer' />)

    await user.click(screen.getByLabelText(/Go to step 3:/))
    expect(screen.getByText('Step 0/8')).toBeDefined()

    await user.click(screen.getByLabelText('Next step'))
    expect(screen.getByText('Step 1/8')).toBeDefined()
  })

  it('should mark the lesson complete on finishing the last step', async () => {
    const user = userEvent.setup()
    render(<LessonPlayer lessonId='second-layer' />)

    await user.click(screen.getByLabelText(/Go to step 6:/))
    await user.click(screen.getByText('Finish chapter'))

    await waitFor(() => {
      expect(screen.getByLabelText('Chapter completed')).toBeDefined()
    })
    expect($progress.get().completedLessons).toContain('second-layer')
  })

  it('should render a not-found state for an unknown lesson id', () => {
    render(<LessonPlayer lessonId='does-not-exist' />)
    expect(screen.getByText('Lesson not found')).toBeDefined()
  })
})
