import {
  applyMoves,
  createSolvedState,
  getAlgorithm,
  invertMoves,
  toStickers
} from '@packages/cube-engine'
import { beforeEach, describe, expect, it } from 'bun:test'

import {
  crossMisaligned,
  whiteCornersState,
  whiteCrossOnly,
  whiteCrossOnlyState
} from '~/features/coach/data/illustrative'
import { LESSONS, getLesson } from '~/features/coach/data/lessons'
import {
  $currentLessonId,
  $currentStepMoves,
  $demoFrame,
  $interactiveFrame,
  $interactiveMoves,
  $isPracticeSolved,
  $lessonStepIndex,
  $playbackIndex,
  $playbackTotal,
  $practiceFrame,
  $practiceMoves,
  $practiceProgress,
  $progress,
  $understandVisual,
  applyInteractiveMove,
  applyPracticeMove,
  goToStep,
  nextStep,
  parseCoachProgress,
  previousStep,
  resetInteractive,
  resetPractice,
  markLessonComplete,
  resolveStepVisual,
  startLesson
} from '~/features/coach/stores/coachStore'
import type { CoachProgress } from '~/features/coach/stores/coachStore'
import { createVersionedStorage } from '~/lib/storage'

const FLIP = getAlgorithm('white-cross-flip')?.moves ?? []
const DEMO_STEP = 3
const PRACTICE_STEP = 4
const solved = () => toStickers(createSolvedState())
// Ch1's demo/practice resolve to the white-cross milestone (not solved): the case
// is that milestone with the algorithm's footprint reversed, so the surrounding
// layers stay scrambled and applying the algorithm lands back on the cross.
const crossGoal = () => whiteCrossOnly()
const crossCaseStickers = () => toStickers(applyMoves(whiteCrossOnlyState(), invertMoves(FLIP)))
// The understand `caseOf` visual still renders on solved (default goal).
const caseFromSolved = () => toStickers(applyMoves(createSolvedState(), invertMoves(FLIP)))

beforeEach(() => {
  localStorage.clear()
  $progress.set({ completedLessons: [], current: { lesson: null, step: 0 } })
  $currentLessonId.set(null)
  $lessonStepIndex.set(0)
  $playbackIndex.set(0)
  $interactiveMoves.set([])
  $practiceMoves.set([])
})

describe('coach progress', () => {
  it('should record the current lesson and step on start', () => {
    startLesson('white-cross')
    expect($currentLessonId.get()).toBe('white-cross')
    expect($progress.get().current).toEqual({ lesson: 'white-cross', step: 0 })
  })

  it('should mark a lesson complete idempotently', () => {
    markLessonComplete('white-cross')
    expect($progress.get().completedLessons).toEqual(['white-cross'])
    markLessonComplete('white-cross')
    expect($progress.get().completedLessons).toEqual(['white-cross'])
  })

  it('should round-trip progress through the versioned helper', () => {
    startLesson('white-cross')
    goToStep(3)
    markLessonComplete('white-cross')

    const reloaded = createVersionedStorage<CoachProgress>({
      key: 'cubeMaster:coachProgress',
      version: 1,
      fallback: { completedLessons: [], current: { lesson: null, step: 0 } }
    }).load()

    expect(reloaded.completedLessons).toEqual(['white-cross'])
    expect(reloaded.current).toEqual({ lesson: 'white-cross', step: 3 })
  })

  it('should resume the saved step when re-entering the same lesson', () => {
    startLesson('white-cross')
    goToStep(3)
    startLesson('white-cross')
    expect($lessonStepIndex.get()).toBe(3)
  })

  it('should reject a version-matching but malformed stored envelope', () => {
    localStorage.setItem(
      'cubeMaster:coachProgress',
      JSON.stringify({ version: 1, data: { completedLessons: 'nope' } })
    )
    const fallback: CoachProgress = { completedLessons: [], current: { lesson: null, step: 0 } }
    const storage = createVersionedStorage<CoachProgress>({
      key: 'cubeMaster:coachProgress',
      version: 1,
      fallback,
      validate: parseCoachProgress
    })
    expect(storage.load()).toEqual(fallback)
  })
})

describe('understand visuals', () => {
  it('should resolve the goal visual to the white-cross-only cube with its highlight', () => {
    startLesson('white-cross')
    goToStep(0)
    const visual = $understandVisual.get()
    expect(visual?.stickers).toEqual(whiteCrossOnly())
    // The plus shape: the white centre plus the four U edges (the centre belongs
    // to the cross, so it stays lit, not veiled).
    expect(visual?.highlight?.U).toEqual([1, 3, 4, 5, 7])
  })

  it('should expose no understand visual on a demo step', () => {
    startLesson('white-cross')
    goToStep(DEMO_STEP)
    expect($understandVisual.get()).toBeNull()
  })

  it('should resolve illustrative and case states directly', () => {
    expect(resolveStepVisual({ state: 'solved' })?.stickers).toEqual(solved())
    expect(resolveStepVisual({ state: 'white-cross-only' })?.stickers).toEqual(whiteCrossOnly())
    expect(resolveStepVisual({ state: 'cross-misaligned' })?.stickers).toEqual(crossMisaligned())
    expect(resolveStepVisual({ state: { caseOf: 'white-cross-flip' } })?.stickers).toEqual(
      caseFromSolved()
    )
  })
})

describe('demo playback', () => {
  it('should expose no frame for an understand step', () => {
    startLesson('white-cross')
    goToStep(0)
    expect($demoFrame.get()).toBeNull()
  })

  it('should play a case demo from the case at index 0 forward to the cross milestone', () => {
    startLesson('white-cross')
    goToStep(DEMO_STEP)
    expect($playbackTotal.get()).toBe(FLIP.length)

    $playbackIndex.set(0)
    expect($demoFrame.get()).toEqual(crossCaseStickers())

    $playbackIndex.set(FLIP.length)
    expect($demoFrame.get()).toEqual(crossGoal())
    // The milestone is *not* the solved cube — the surrounding layers stay mixed.
    expect($demoFrame.get()).not.toEqual(solved())
  })

  it('should clamp next/previous to [0, total]', () => {
    startLesson('white-cross')
    goToStep(DEMO_STEP)
    const total = $playbackTotal.get()

    $playbackIndex.set(0)
    previousStep()
    expect($playbackIndex.get()).toBe(0)

    for (let i = 0; i < total + 3; i++) nextStep()
    expect($playbackIndex.get()).toBe(total)
  })
})

describe('practice (interactive)', () => {
  it('should start from the case and reach the cross milestone as the learner taps the moves', () => {
    startLesson('white-cross')
    goToStep(PRACTICE_STEP)

    // Before any tap: the case, surrounding layers scrambled, not yet solved.
    expect($practiceFrame.get()).toEqual(crossCaseStickers())
    expect($practiceProgress.get()).toBe(0)
    expect($isPracticeSolved.get()).toBe(false)
    // The demo frame is demo-only now — practice is driven by the learner's taps.
    expect($demoFrame.get()).toBeNull()

    // The learner *executes* the algorithm, move by move.
    for (const move of FLIP) applyPracticeMove(move)

    expect($practiceProgress.get()).toBe(FLIP.length)
    expect($practiceFrame.get()).toEqual(crossGoal())
    expect($practiceFrame.get()).not.toEqual(solved())
    expect($isPracticeSolved.get()).toBe(true)
  })

  it('should not count a wrong tap as progress, and reset cleanly', () => {
    startLesson('white-cross')
    goToStep(PRACTICE_STEP)

    // The algorithm starts with D, so a U tap is wrong: no progress, not solved.
    applyPracticeMove('U')
    expect($practiceProgress.get()).toBe(0)
    expect($isPracticeSolved.get()).toBe(false)

    resetPractice()
    expect($practiceMoves.get()).toEqual([])
    expect($practiceFrame.get()).toEqual(crossCaseStickers())
  })
})

describe('chapter 2 — teaching demos + full-chapter practice', () => {
  const lesson = () => getLesson('white-corners')!
  const demoIndexes = () =>
    lesson()
      .steps.map((step, i) => (step.kind === 'demo' ? i : -1))
      .filter(i => i >= 0)
  const practiceIndex = () => lesson().steps.findIndex(step => step.kind === 'chapter-practice')

  // A2 — the full-chapter practice starts from the *previous* milestone (nothing of
  // the chapter solved) and succeeds only on reaching this chapter's milestone.
  it('runs the practice from white-cross-only to the white-corners milestone', () => {
    startLesson('white-corners')
    goToStep(practiceIndex())

    // Starts on the previous milestone, not yet solved.
    expect($practiceFrame.get()).toEqual(whiteCrossOnly())
    expect($isPracticeSolved.get()).toBe(false)

    // The learner executes the whole teaching recipe, move by move.
    for (const move of $currentStepMoves.get()) applyPracticeMove(move)

    expect($isPracticeSolved.get()).toBe(true)
    expect($practiceFrame.get()).toEqual(toStickers(whiteCornersState()))
  })

  // A3 — more than one demo, and the practice is not a replay of any demo (the
  // demo==practice defect is gone): every demo plays a *different* recipe than the
  // whole-chapter practice (a single corner vs all four).
  it('has several demos, none of which replays the full-chapter practice', () => {
    expect(demoIndexes().length).toBeGreaterThan(1)

    startLesson('white-corners')
    goToStep(practiceIndex())
    const practiceMoves = $currentStepMoves.get().join(' ')

    for (const index of demoIndexes()) {
      goToStep(index)
      const demoMoves = $currentStepMoves.get()
      expect(demoMoves.length).toBeGreaterThan(0)
      expect(demoMoves.join(' ')).not.toBe(practiceMoves)
    }
  })
})

describe('every full-chapter practice reaches its milestone (A2, all chapters)', () => {
  const withPractice = LESSONS.filter(lesson =>
    lesson.steps.some(step => step.kind === 'chapter-practice')
  )

  for (const lesson of withPractice) {
    it(`${lesson.id} — executing the whole teaching recipe solves the chapter`, () => {
      startLesson(lesson.id)
      const index = lesson.steps.findIndex(step => step.kind === 'chapter-practice')
      goToStep(index)

      const recipe = $currentStepMoves.get()
      expect(recipe.length).toBeGreaterThan(0)
      expect($isPracticeSolved.get()).toBe(false)

      for (const move of recipe) applyPracticeMove(move)
      expect($isPracticeSolved.get()).toBe(true)
    })
  }
})

describe('interactive primer', () => {
  it('should turn the local cube as face moves are tapped', () => {
    applyInteractiveMove('R')
    expect($interactiveFrame.get()).toEqual(toStickers(applyMoves(createSolvedState(), ['R'])))

    applyInteractiveMove("R'")
    expect($interactiveFrame.get()).toEqual(solved())
  })

  it('should clear tapped moves on reset and on step change', () => {
    applyInteractiveMove('R')
    resetInteractive()
    expect($interactiveMoves.get()).toEqual([])

    startLesson('cube-reading')
    applyInteractiveMove('R')
    goToStep(0)
    expect($interactiveMoves.get()).toEqual([])
  })
})
