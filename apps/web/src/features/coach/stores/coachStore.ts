import { useStore } from '@nanostores/react'
import type { FaceCode, MoveToken, StickersByFace } from '@packages/cube-engine'
import {
  applyMoves,
  createSolvedState,
  getAlgorithm,
  invertMoves,
  toStickers
} from '@packages/cube-engine'
import { atom, computed } from 'nanostores'

import { crossMisaligned, whiteCrossOnly } from '~/features/coach/data/illustrative'
import { getLesson } from '~/features/coach/data/lessons'
import type { Lesson, LessonStep, StepVisual } from '~/features/coach/data/types'
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
// Moves the learner has tapped on a Chapter 0 `interactive` step, applied to a
// local solved cube. Reset whenever the step changes.
export const $interactiveMoves = atom<MoveToken[]>([])
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
  if (step === null || step.kind === 'understand' || step.kind === 'interactive') return []
  return getAlgorithm(step.algorithmId)?.moves ?? []
}

// True when a demo/practice frame should start from the case (inverse-scramble of
// the algorithm) and play forward to solved. Practice always does; a demo does
// unless it opts into solved→forward via demoFrom: 'solved' (the sexy move). (D-DEMO)
const playsFromCase = (step: LessonStep): boolean =>
  step.kind === 'practice' || (step.kind === 'demo' && (step.demoFrom ?? 'case') === 'case')

// The move sequence the current step teaches — shown as notation so the learner
// reads the algorithm (R, D, R′ …), not just the animated cube.
export const $currentStepMoves = computed($currentStep, (step): readonly MoveToken[] =>
  stepMoves(step)
)

export const $playbackTotal = computed($currentStepMoves, (moves): number => moves.length)

// The cube frame for a demo/practice step at the current playback index. Case
// demos and all practice start from the inverse-scramble of the case and play
// forward to solved (the learner watches it *resolve*); a solved-demo starts
// solved and plays forward to reveal what the algorithm does. (D-DEMO / PD3)
export const $demoFrame = computed(
  [$currentStep, $playbackIndex],
  (step, index): StickersByFace | null => {
    if (step === null || step.kind === 'understand' || step.kind === 'interactive') return null
    const moves = stepMoves(step)
    const base = playsFromCase(step)
      ? applyMoves(createSolvedState(), invertMoves(moves))
      : createSolvedState()
    return toStickers(applyMoves(base, moves.slice(0, index)))
  }
)

// The cube state + highlight an `understand` step illustrates: the solved/goal
// cube, an illustrative state, or an algorithm's case (applyMoves(solved,
// invert(alg))) so what the learner recognises is exactly what the matching demo
// resolves. (D-VISUAL / PD2)
export type UnderstandVisual = {
  stickers: StickersByFace
  highlight?: Partial<Record<FaceCode, readonly number[]>>
}

// Resolve a step visual to concrete stickers + its highlight. Pure — usable both
// reactively (the current step) and directly (a comparison's two nets). The
// partial states come from the solver-derived illustrative module (memoised).
export const resolveStepVisual = (visual: StepVisual): UnderstandVisual | null => {
  const { state, highlight } = visual
  if (state === 'solved') return { stickers: SOLVED_STICKERS, highlight }
  if (state === 'white-cross-only') return { stickers: whiteCrossOnly(), highlight }
  if (state === 'cross-misaligned') return { stickers: crossMisaligned(), highlight }
  const algorithm = getAlgorithm(state.caseOf)
  if (!algorithm) return null
  return {
    stickers: toStickers(applyMoves(createSolvedState(), invertMoves(algorithm.moves))),
    highlight
  }
}

export const $understandVisual = computed($currentStep, (step): UnderstandVisual | null =>
  step?.kind === 'understand' && step.visual ? resolveStepVisual(step.visual) : null
)

// The live cube for a Chapter 0 `interactive` step — solved plus every move the
// learner has tapped so far. Reuses applyMoves, so no engine change. (PD4)
export const $interactiveFrame = computed(
  $interactiveMoves,
  (moves): StickersByFace => toStickers(applyMoves(createSolvedState(), moves))
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

const resetStepState = () => {
  $playbackIndex.set(0)
  $interactiveMoves.set([])
}

export const startLesson = (lessonId: string) => {
  $currentLessonId.set(lessonId)
  const lesson = getLesson(lessonId)
  const progress = $progress.get()
  const resume = progress.current.lesson === lessonId ? progress.current.step : 0
  const maxStep = lesson ? Math.max(0, lesson.steps.length - 1) : 0
  const step = Math.min(Math.max(0, resume), maxStep)
  $lessonStepIndex.set(step)
  resetStepState()
  setCurrent(lessonId, step)
}

export const goToStep = (index: number) => {
  const lesson = $currentLesson.get()
  if (!lesson) return
  const clamped = Math.min(Math.max(0, index), lesson.steps.length - 1)
  $lessonStepIndex.set(clamped)
  resetStepState()
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

// Tap a single face turn on a Chapter 0 interactive step — applied to the local
// live cube so the learner sees notation turn into motion.
export const applyInteractiveMove = (move: MoveToken) => {
  $interactiveMoves.set([...$interactiveMoves.get(), move])
}

export const resetInteractive = () => {
  $interactiveMoves.set([])
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
export const useUnderstandVisual = (): UnderstandVisual | null => useStore($understandVisual)
export const useInteractiveFrame = (): StickersByFace => useStore($interactiveFrame)
export const useInteractiveMoves = (): MoveToken[] => useStore($interactiveMoves)
export const useIsPracticeSolved = (): boolean => useStore($isPracticeSolved)
export const useProgress = (): CoachProgress => useStore($progress)
