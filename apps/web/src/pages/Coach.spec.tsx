import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { $progress } from '~/features/coach/stores/coachStore'
import { Coach } from '~/pages/Coach'

beforeEach(() => {
  localStorage.clear()
  $progress.set({ completedLessons: [], current: { lesson: null, step: 0 } })
})

afterEach(() => {
  cleanup()
})

describe('Coach', () => {
  it('should list the authored beginner chapters in order', () => {
    render(<Coach />)
    const beginner = screen.getByRole('heading', { name: 'Beginner' }).parentElement!
    const titles = within(beginner)
      .getAllByRole('link')
      .map(link => link.textContent ?? '')
    expect(titles[0]).toContain('White Cross')
    expect(titles[1]).toContain('White Corners')
    expect(titles[2]).toContain('Second Layer')
  })

  it('should reflect completion state with a marker', () => {
    $progress.set({ completedLessons: ['white-cross'], current: { lesson: null, step: 0 } })
    render(<Coach />)
    expect(screen.getByLabelText('Completed')).toBeDefined()
  })

  it('should offer a start CTA when nothing is in progress', () => {
    render(<Coach />)
    expect(screen.getByText(/Start: White Cross/)).toBeDefined()
  })

  it('should offer a resume CTA pointing at the in-progress chapter', () => {
    $progress.set({ completedLessons: [], current: { lesson: 'white-corners', step: 1 } })
    render(<Coach />)
    expect(screen.getByText(/Resume: White Corners/)).toBeDefined()
  })

  it('should render the empty intermediate and advanced tiers without error', () => {
    render(<Coach />)
    expect(screen.getByRole('heading', { name: 'Intermediate' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Advanced' })).toBeDefined()
    expect(screen.getAllByText('More chapters coming soon.').length).toBe(2)
  })

  it('should render the lesson player when given a lessonId', () => {
    render(<Coach lessonId='second-layer' />)
    expect(screen.getByRole('heading', { name: 'Meet the middle layer' })).toBeDefined()
  })
})
