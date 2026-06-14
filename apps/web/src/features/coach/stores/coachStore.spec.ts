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
  $inverseMoves,
  $isPracticeSolved,
  $lessonStepIndex,
  $playbackIndex,
  $playbackTotal,
  $progress,
  goToStep,
  nextStep,
  parseCoachProgress,
  previousStep,
  startLesson,
  toggleLessonComplete
} from '~/features/coach/stores/coachStore'
import type { CoachProgress } from '~/features/coach/stores/coachStore'
import { createVersionedStorage } from '~/lib/storage'

const RIGHT_INSERT = getAlgorithm('second-layer-insert-right')?.moves ?? []
const DEMO_RIGHT_STEP = 2
const PRACTICE_STEP = 5

beforeEach(() => {
  localStorage.clear()
  $progress.set({ completedLessons: [], current: { lesson: null, step: 0 } })
  $currentLessonId.set(null)
  $lessonStepIndex.set(0)
  $playbackIndex.set(0)
})

describe('coach progress', () => {
  it('should record the current lesson and step on start', () => {
    startLesson('second-layer')
    expect($currentLessonId.get()).toBe('second-layer')
    expect($progress.get().current).toEqual({ lesson: 'second-layer', step: 0 })
  })

  it('should toggle a lesson between complete and not complete', () => {
    toggleLessonComplete('second-layer')
    expect($progress.get().completedLessons).toEqual(['second-layer'])
    toggleLessonComplete('second-layer')
    expect($progress.get().completedLessons).toEqual([])
  })

  it('should round-trip progress through the versioned helper', () => {
    startLesson('second-layer')
    goToStep(4)
    toggleLessonComplete('second-layer')

    const reloaded = createVersionedStorage<CoachProgress>({
      key: 'cubeMaster:coachProgress',
      version: 1,
      fallback: { completedLessons: [], current: { lesson: null, step: 0 } }
    }).load()

    expect(reloaded.completedLessons).toEqual(['second-layer'])
    expect(reloaded.current).toEqual({ lesson: 'second-layer', step: 4 })
  })

  it('should resume the saved step when re-entering the same lesson', () => {
    startLesson('second-layer')
    goToStep(4)
    startLesson('second-layer')
    expect($lessonStepIndex.get()).toBe(4)
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

describe('demo playback', () => {
  it('should expose no frame for an understand step', () => {
    startLesson('second-layer')
    goToStep(0)
    expect($demoFrame.get()).toBeNull()
  })

  it('should start from solved at index 0 and reveal the case at the end', () => {
    startLesson('second-layer')
    goToStep(DEMO_RIGHT_STEP)
    expect($playbackTotal.get()).toBe(RIGHT_INSERT.length)

    $playbackIndex.set(0)
    expect($demoFrame.get()).toEqual(toStickers(createSolvedState()))

    $playbackIndex.set(RIGHT_INSERT.length)
    expect($demoFrame.get()).toEqual(toStickers(applyMoves(createSolvedState(), RIGHT_INSERT)))
  })

  it('should expose the inverse algorithm so a demo can be reset to solved', () => {
    startLesson('second-layer')
    goToStep(DEMO_RIGHT_STEP)
    expect($inverseMoves.get()).toEqual(invertMoves(RIGHT_INSERT))
  })

  it('should clamp next/previous to [0, total]', () => {
    startLesson('second-layer')
    goToStep(DEMO_RIGHT_STEP)
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
    startLesson('second-layer')
    goToStep(PRACTICE_STEP)

    $playbackIndex.set(0)
    expect($demoFrame.get()).toEqual(
      toStickers(applyMoves(createSolvedState(), invertMoves(RIGHT_INSERT)))
    )
    expect($isPracticeSolved.get()).toBe(false)

    $playbackIndex.set(RIGHT_INSERT.length)
    expect($demoFrame.get()).toEqual(toStickers(createSolvedState()))
    expect($isPracticeSolved.get()).toBe(true)
  })
})
