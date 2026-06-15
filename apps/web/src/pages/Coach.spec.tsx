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
  it('should list the proof-slice chapters in journey order', () => {
    render(<Coach />)
    const beginner = screen.getByRole('heading', { name: 'Débutant' }).parentElement!
    const titles = within(beginner)
      .getAllByRole('link')
      .map(link => link.textContent ?? '')
    expect(titles[0]).toContain('Lire le cube')
    expect(titles[1]).toContain('La croix blanche')
  })

  it('should reflect completion state with a marker', () => {
    $progress.set({ completedLessons: ['white-cross'], current: { lesson: null, step: 0 } })
    render(<Coach />)
    expect(screen.getByLabelText('Terminé')).toBeDefined()
  })

  it('should offer a start CTA when nothing is in progress', () => {
    render(<Coach />)
    expect(screen.getByText(/Commencer : Lire le cube/)).toBeDefined()
  })

  it('should offer a resume CTA pointing at the in-progress chapter', () => {
    $progress.set({ completedLessons: [], current: { lesson: 'white-cross', step: 1 } })
    render(<Coach />)
    expect(screen.getByText(/Reprendre : La croix blanche/)).toBeDefined()
  })

  it('should render the empty intermediate and advanced tiers without error', () => {
    render(<Coach />)
    expect(screen.getByRole('heading', { name: 'Intermédiaire' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Avancé' })).toBeDefined()
    expect(screen.getAllByText("D'autres chapitres arrivent bientôt.").length).toBe(2)
  })

  it('should render the lesson player when given a lessonId', () => {
    render(<Coach lessonId='white-cross' />)
    expect(screen.getByRole('heading', { name: "La croix blanche, c'est quoi" })).toBeDefined()
  })
})
