import {
  applyMoves,
  createSolvedState,
  getAlgorithm,
  invertMoves,
  toStickers
} from '@packages/cube-engine'
import { beforeEach, describe, expect, it } from 'bun:test'

import {
  $currentLessonId,
  $demoFrame,
  $interactiveFrame,
  $interactiveMoves,
  $isPracticeSolved,
  $lessonStepIndex,
  $playbackIndex,
  $playbackTotal,
  $progress,
  $understandVisual,
  applyInteractiveMove,
  goToStep,
  nextStep,
  parseCoachProgress,
  previousStep,
  resetInteractive,
  resolveStepVisual,
  startLesson,
  toggleLessonComplete
} from '~/features/coach/stores/coachStore'
import type { CoachProgress } from '~/features/coach/stores/coachStore'
import { createVersionedStorage } from '~/lib/storage'

const FLIP = getAlgorithm('white-cross-flip')?.moves ?? []
const DEMO_STEP = 3
const PRACTICE_STEP = 4
const solved = () => toStickers(createSolvedState())
const caseStickers = () => toStickers(applyMoves(createSolvedState(), invertMoves(FLIP)))

beforeEach(() => {
  localStorage.clear()
  $progress.set({ completedLessons: [], current: { lesson: null, step: 0 } })
  $currentLessonId.set(null)
  $lessonStepIndex.set(0)
  $playbackIndex.set(0)
  $interactiveMoves.set([])
})

describe('coach progress', () => {
  it('should record the current lesson and step on start', () => {
    startLesson('white-cross')
    expect($currentLessonId.get()).toBe('white-cross')
    expect($progress.get().current).toEqual({ lesson: 'white-cross', step: 0 })
  })

  it('should toggle a lesson between complete and not complete', () => {
    toggleLessonComplete('white-cross')
    expect($progress.get().completedLessons).toEqual(['white-cross'])
    toggleLessonComplete('white-cross')
    expect($progress.get().completedLessons).toEqual([])
  })

  it('should round-trip progress through the versioned helper', () => {
    startLesson('white-cross')
    goToStep(3)
    toggleLessonComplete('white-cross')

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
  it('should resolve the goal visual to the solved cube with its highlight', () => {
    startLesson('white-cross')
    goToStep(0)
    const visual = $understandVisual.get()
    expect(visual?.stickers).toEqual(solved())
    expect(visual?.highlight?.U).toEqual([1, 3, 5, 7])
  })

  it('should expose no understand visual on a demo step', () => {
    startLesson('white-cross')
    goToStep(DEMO_STEP)
    expect($understandVisual.get()).toBeNull()
  })

  it('should resolve illustrative and case states directly', () => {
    expect(resolveStepVisual({ state: 'solved' })?.stickers).toEqual(solved())
    expect(resolveStepVisual({ state: 'cross-misaligned' })?.stickers).toEqual(
      toStickers(applyMoves(createSolvedState(), ['U']))
    )
    expect(resolveStepVisual({ state: { caseOf: 'white-cross-flip' } })?.stickers).toEqual(
      caseStickers()
    )
  })
})

describe('demo playback', () => {
  it('should expose no frame for an understand step', () => {
    startLesson('white-cross')
    goToStep(0)
    expect($demoFrame.get()).toBeNull()
  })

  it('should play a case demo from the case at index 0 forward to solved', () => {
    startLesson('white-cross')
    goToStep(DEMO_STEP)
    expect($playbackTotal.get()).toBe(FLIP.length)

    $playbackIndex.set(0)
    expect($demoFrame.get()).toEqual(caseStickers())

    $playbackIndex.set(FLIP.length)
    expect($demoFrame.get()).toEqual(solved())
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

describe('practice setup', () => {
  it('should start from the inverse-scramble of the case and resolve to solved', () => {
    startLesson('white-cross')
    goToStep(PRACTICE_STEP)

    $playbackIndex.set(0)
    expect($demoFrame.get()).toEqual(caseStickers())
    expect($isPracticeSolved.get()).toBe(false)

    $playbackIndex.set(FLIP.length)
    expect($demoFrame.get()).toEqual(solved())
    expect($isPracticeSolved.get()).toBe(true)
  })
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
