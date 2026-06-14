import { useStore } from '@nanostores/react'
import type { MoveToken, StickersByFace } from '@packages/cube-engine'
import {
  applyMoves,
  createSolvedState,
  getAlgorithm,
  invertMoves,
  toStickers
} from '@packages/cube-engine'
import { atom, computed } from 'nanostores'

import { getLesson } from '~/features/coach/data/lessons'
import type { Lesson, LessonStep } from '~/features/coach/data/types'
import { createVersionedStorage } from '~/lib/storage'

// Progress is persisted via the shared versioned helper (ADR-0007) at version 1
// from day one, so a future schema change is detectable. `current` records where
// the learner was so the player can resume after reload.
export type CoachProgress = {
  completedLessons: string[]
  current: { lesson: string | null; step: number }
}

const PROGRESS_KEY = 'cubeMaster:coachProgress'

const defaultProgress: CoachProgress = {
  completedLessons: [],
  current: { lesson: null, step: 0 }
}

// Validate a decoded v1 envelope before trusting it as CoachProgress. Without
// this, a version-matching but malformed `data` would be cast straight to the
// typed shape — ADR-0007's "never coerce a mismatched shape" only holds when the
// caller validates. A bad shape (tampered/older bug) then falls back to default.
export const parseCoachProgress = (data: unknown): CoachProgress | null => {
  if (typeof data !== 'object' || data === null) return null
  const { completedLessons, current } = data as Record<string, unknown>
  if (!Array.isArray(completedLessons) || completedLessons.some(id => typeof id !== 'string')) {
    return null
  }
  if (typeof current !== 'object' || current === null) return null
  const { lesson, step } = current as Record<string, unknown>
  if ((lesson !== null && typeof lesson !== 'string') || typeof step !== 'number') return null
  return {
    completedLessons: completedLessons as string[],
    current: { lesson, step }
  }
}

const progressStorage = createVersionedStorage<CoachProgress>({
  key: PROGRESS_KEY,
  version: 1,
  fallback: defaultProgress,
  validate: parseCoachProgress
})

const SOLVED_STICKERS = toStickers(createSolvedState())

// --- atoms ---

export const $currentLessonId = atom<string | null>(null)
export const $lessonStepIndex = atom<number>(0)
export const $playbackIndex = atom<number>(0)
export const $progress = atom<CoachProgress>(progressStorage.load())

$progress.listen(progressStorage.save)

// --- computed ---

export const $currentLesson = computed($currentLessonId, (id): Lesson | null =>
  id === null ? null : (getLesson(id) ?? null)
)

export const $currentStep = computed(
  [$currentLesson, $lessonStepIndex],
  (lesson, index): LessonStep | null => lesson?.steps[index] ?? null
)

const stepMoves = (step: LessonStep | null): readonly MoveToken[] => {
  if (step === null || step.kind === 'understand') return []
  return getAlgorithm(step.algorithmId)?.moves ?? []
}

// The move sequence the current step teaches — shown as notation so the learner
// reads the algorithm (R, D, R′ …), not just the animated cube.
export const $currentStepMoves = computed($currentStep, (step): readonly MoveToken[] =>
  stepMoves(step)
)

export const $playbackTotal = computed($currentStepMoves, (moves): number => moves.length)

// Coach's own copy of the Solver's `$cubeAtStep` shape — it does not import solver
// atoms. A demo plays forward from a solved cube so the learner sees what the
// algorithm *does* to the cube; practice starts from the inverse-scramble of the
// case and plays forward, returning the cube to solved.
export const $demoFrame = computed(
  [$currentStep, $playbackIndex],
  (step, index): StickersByFace | null => {
    if (step === null || step.kind === 'understand') return null
    const moves = stepMoves(step)
    const base =
      step.kind === 'practice'
        ? applyMoves(createSolvedState(), invertMoves(moves))
        : createSolvedState()
    return toStickers(applyMoves(base, moves.slice(0, index)))
  }
)

// The inverse of a demo's algorithm, shown as notation only (no CubeNet). A demo
// scrambles a solved cube to reveal the case; a beginner can't yet invert an
// algorithm, so we hand them the exact sequence that resets their cube to solved.
export const $inverseMoves = computed($currentStepMoves, (moves): readonly MoveToken[] =>
  invertMoves(moves)
)

const stickersEqual = (a: StickersByFace, b: StickersByFace): boolean =>
  (['U', 'D', 'F', 'B', 'L', 'R'] as const).every(face =>
    a[face].every((color, i) => color === b[face][i])
  )

// Practice success = full solved-state equality (Decision D4): the case is the
// inverse of the algorithm, so executing it fully returns the cube to solved.
export const $isPracticeSolved = computed(
  [$currentStep, $demoFrame],
  (step, frame): boolean =>
    step?.kind === 'practice' && frame !== null && stickersEqual(frame, SOLVED_STICKERS)
)

// --- actions ---

const setCurrent = (lesson: string | null, step: number) => {
  $progress.set({ ...$progress.get(), current: { lesson, step } })
}

export const startLesson = (lessonId: string) => {
  $currentLessonId.set(lessonId)
  const lesson = getLesson(lessonId)
  const progress = $progress.get()
  const resume = progress.current.lesson === lessonId ? progress.current.step : 0
  const maxStep = lesson ? Math.max(0, lesson.steps.length - 1) : 0
  const step = Math.min(Math.max(0, resume), maxStep)
  $lessonStepIndex.set(step)
  $playbackIndex.set(0)
  setCurrent(lessonId, step)
}

export const goToStep = (index: number) => {
  const lesson = $currentLesson.get()
  if (!lesson) return
  const clamped = Math.min(Math.max(0, index), lesson.steps.length - 1)
  $lessonStepIndex.set(clamped)
  $playbackIndex.set(0)
  setCurrent($currentLessonId.get(), clamped)
}

export const nextStep = () => {
  const total = $playbackTotal.get()
  const current = $playbackIndex.get()
  if (current < total) $playbackIndex.set(current + 1)
}

export const previousStep = () => {
  const current = $playbackIndex.get()
  if (current > 0) $playbackIndex.set(current - 1)
}

// Mark/unmark a lesson as complete — a toggle so a learner can correct a
// mis-click. The final "next chapter" navigation is a C1 (lesson browser) concern.
export const toggleLessonComplete = (lessonId: string) => {
  const progress = $progress.get()
  const isDone = progress.completedLessons.includes(lessonId)
  $progress.set({
    ...progress,
    completedLessons: isDone
      ? progress.completedLessons.filter(id => id !== lessonId)
      : [...progress.completedLessons, lessonId]
  })
}

// --- hooks ---

export const useCurrentLesson = (): Lesson | null => useStore($currentLesson)
export const useCurrentStep = (): LessonStep | null => useStore($currentStep)
export const useLessonStepIndex = (): number => useStore($lessonStepIndex)
export const usePlaybackIndex = (): number => useStore($playbackIndex)
export const usePlaybackTotal = (): number => useStore($playbackTotal)
export const useCurrentStepMoves = (): readonly MoveToken[] => useStore($currentStepMoves)
export const useDemoFrame = (): StickersByFace | null => useStore($demoFrame)
export const useInverseMoves = (): readonly MoveToken[] => useStore($inverseMoves)
export const useIsPracticeSolved = (): boolean => useStore($isPracticeSolved)
export const useProgress = (): CoachProgress => useStore($progress)
