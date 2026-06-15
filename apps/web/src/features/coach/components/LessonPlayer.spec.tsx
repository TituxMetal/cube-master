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
  it('should render the White Cross chapter and its first step', () => {
    render(<LessonPlayer lessonId='white-cross' />)
    expect(screen.getByText('La croix blanche')).toBeDefined()
    expect(screen.getByRole('heading', { name: "La croix blanche, c'est quoi" })).toBeDefined()
  })

  it('should advance demo frames with the French stepper', async () => {
    const user = userEvent.setup()
    render(<LessonPlayer lessonId='white-cross' />)

    await user.click(screen.getByLabelText(/^Étape 4 :/))
    expect(screen.getByText('Coup 0/4')).toBeDefined()

    await user.click(screen.getByLabelText('Coup suivant'))
    expect(screen.getByText('Coup 1/4')).toBeDefined()
  })

  it('should show the algorithm notation, not only the animated cube', async () => {
    const user = userEvent.setup()
    render(<LessonPlayer lessonId='white-cross' />)

    await user.click(screen.getByLabelText(/^Étape 4 :/))
    // white-cross-flip = D R F' R'
    expect(screen.getByLabelText('Algorithm notation').textContent).toBe("DRF'R'")
  })

  it('should carry a notation cheat-sheet in every lesson', () => {
    render(<LessonPlayer lessonId='white-cross' />)
    expect(screen.getByText('Aide-mémoire des coups')).toBeDefined()
  })

  it('should let the learner tap a face turn on the Chapter 0 primer', async () => {
    const user = userEvent.setup()
    render(<LessonPlayer lessonId='cube-reading' />)

    await user.click(screen.getByLabelText(/^Étape 2 :/))
    expect(screen.getByLabelText('Tourner R')).toBeDefined()
    await user.click(screen.getByLabelText('Tourner R'))
    expect(screen.getByText('Réinitialiser')).toBeDefined()
  })

  it('should toggle the lesson complete on the last step', async () => {
    const user = userEvent.setup()
    render(<LessonPlayer lessonId='white-cross' />)

    await user.click(screen.getByLabelText(/^Étape 5 :/))
    await user.click(screen.getByText('Terminer le chapitre'))

    await waitFor(() => {
      expect(screen.getByLabelText('Chapitre terminé')).toBeDefined()
    })
    expect($progress.get().completedLessons).toContain('white-cross')

    await user.click(screen.getByText('Marquer comme non terminé'))
    await waitFor(() => {
      expect(screen.queryByLabelText('Chapitre terminé')).toBeNull()
    })
    expect($progress.get().completedLessons).not.toContain('white-cross')
  })

  it('should render a not-found state for an unknown lesson id', () => {
    render(<LessonPlayer lessonId='does-not-exist' />)
    expect(screen.getByText('Leçon introuvable')).toBeDefined()
  })
})
