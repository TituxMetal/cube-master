import { useStore } from '@nanostores/react'
import type { CubeState, FaceCode, MoveToken, StickersByFace } from '@packages/cube-engine'
import {
  applyMoves,
  createSolvedState,
  getAlgorithm,
  invertMoves,
  toStickers
} from '@packages/cube-engine'
import { atom, computed } from 'nanostores'

import { crossMisalignedState, whiteCrossOnlyState } from '~/features/coach/data/illustrative'
import { getLesson } from '~/features/coach/data/lessons'
import type {
  GoalState,
  IllustrativeState,
  Lesson,
  LessonStep,
  StepVisual
} from '~/features/coach/data/types'
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

// Resolve a named state to a concrete cube. Phase milestones double as demo goals;
// the misaligned cross is an understand-only contrast. Solver-derived states are
// memoised in the illustrative module, so this stays cheap.
const namedState = (state: IllustrativeState): CubeState => {
  if (state === 'white-cross-only') return whiteCrossOnlyState()
  if (state === 'cross-misaligned') return crossMisalignedState()
  return createSolvedState()
}

// The milestone a demo/practice step resolves to — its real goal, not necessarily
// the solved cube. Steps without a goal (and every non-algorithm step) target solved.
const stepGoal = (step: LessonStep): GoalState =>
  (step.kind === 'demo' || step.kind === 'practice') && step.goal ? step.goal : 'solved'

// --- atoms ---

export const $currentLessonId = atom<string | null>(null)
export const $lessonStepIndex = atom<number>(0)
export const $playbackIndex = atom<number>(0)
// Moves the learner has tapped on a Chapter 0 `interactive` step, applied to a
// local solved cube. Reset whenever the step changes.
export const $interactiveMoves = atom<MoveToken[]>([])
// Moves the learner has tapped on a `practice` step, applied to the case. Unlike a
// demo (which the learner watches the app step through), practice is the learner
// *executing* the algorithm themselves. Reset whenever the step changes.
export const $practiceMoves = atom<MoveToken[]>([])
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

// The case a demo/practice step starts from: the goal milestone with the
// algorithm's footprint reversed, so the surrounding layers stay scrambled and
// applying the algorithm lands exactly back on the milestone. (the milestone-demo model)
const caseBase = (step: LessonStep): CubeState =>
  applyMoves(namedState(stepGoal(step)), invertMoves(stepMoves(step)))

// The move sequence the current step teaches — shown as notation so the learner
// reads the algorithm (R, D, R′ …), not just the animated cube.
export const $currentStepMoves = computed($currentStep, (step): readonly MoveToken[] =>
  stepMoves(step)
)

export const $playbackTotal = computed($currentStepMoves, (moves): number => moves.length)

// The cube frame for a *demo* step at the current playback index — the one the
// learner watches the app step through. A case demo starts from the case and plays
// forward to the milestone (it *resolves*); a solved→forward demo (the sexy move)
// starts from the milestone and plays forward to reveal what the algorithm does.
// Practice has its own frame ($practiceFrame) driven by the learner's taps.
// (D-DEMO / PD3 / PD6 / the milestone-demo model)
export const $demoFrame = computed(
  [$currentStep, $playbackIndex],
  (step, index): StickersByFace | null => {
    if (step === null || step.kind !== 'demo') return null
    const moves = stepMoves(step)
    const base = (step.demoFrom ?? 'case') === 'case' ? caseBase(step) : namedState(stepGoal(step))
    return toStickers(applyMoves(base, moves.slice(0, index)))
  }
)

// The cube state + highlight an `understand` step illustrates: an illustrative
// state, or an algorithm's case (applyMoves(goal, invert(alg))) so what the
// learner recognises is exactly the state the matching demo resolves. (D-VISUAL / PD2)
export type UnderstandVisual = {
  stickers: StickersByFace
  highlight?: Partial<Record<FaceCode, readonly number[]>>
}

// Resolve a step visual to concrete stickers + its highlight. Pure — usable both
// reactively (the current step) and directly (a comparison's two nets). The
// partial states come from the solver-derived illustrative module (memoised). A
// `caseOf` is rendered on its goal milestone (default solved), matching the demo.
export const resolveStepVisual = (visual: StepVisual): UnderstandVisual | null => {
  const { state, highlight } = visual
  if (typeof state === 'string') return { stickers: toStickers(namedState(state)), highlight }
  const algorithm = getAlgorithm(state.caseOf)
  if (!algorithm) return null
  const goal = namedState(state.goal ?? 'solved')
  return { stickers: toStickers(applyMoves(goal, invertMoves(algorithm.moves))), highlight }
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

// The live cube for a `practice` step — the case plus every move the learner has
// tapped. The learner *executes* the algorithm; the cube responds, so practice is
// genuinely "your turn", not a second viewing of the demo. (PD6)
export const $practiceFrame = computed(
  [$currentStep, $practiceMoves],
  (step, moves): StickersByFace | null =>
    step?.kind === 'practice' ? toStickers(applyMoves(caseBase(step), moves)) : null
)

// How many of the learner's leading taps match the algorithm so far — drives the
// recipe highlight and the next-move hint, and stops at the first wrong tap so a
// mistake shows immediately instead of silently counting.
export const $practiceProgress = computed([$currentStep, $practiceMoves], (step, taps): number => {
  if (step?.kind !== 'practice') return 0
  const expected = stepMoves(step)
  let matched = 0
  while (matched < taps.length && matched < expected.length && taps[matched] === expected[matched])
    matched++
  return matched
})

const stickersEqual = (a: StickersByFace, b: StickersByFace): boolean =>
  (['U', 'D', 'F', 'B', 'L', 'R'] as const).every(face =>
    a[face].every((color, i) => color === b[face][i])
  )

// Practice success = the learner's executed moves bring the case to the step's goal
// milestone (Decision D4): the case is the algorithm's footprint reversed on that
// milestone, so executing the algorithm lands back on it (the solved cube when the
// goal is 'solved').
export const $isPracticeSolved = computed(
  [$currentStep, $practiceFrame],
  (step, frame): boolean =>
    step?.kind === 'practice' &&
    frame !== null &&
    stickersEqual(frame, toStickers(namedState(stepGoal(step))))
)

// --- actions ---

const setCurrent = (lesson: string | null, step: number) => {
  $progress.set({ ...$progress.get(), current: { lesson, step } })
}

const resetStepState = () => {
  $playbackIndex.set(0)
  $interactiveMoves.set([])
  $practiceMoves.set([])
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

// Tap a move on a `practice` step — the learner executes the algorithm themselves,
// move by move, on the case. The cube responds via applyMoves (no engine change).
export const applyPracticeMove = (move: MoveToken) => {
  $practiceMoves.set([...$practiceMoves.get(), move])
}

export const resetPractice = () => {
  $practiceMoves.set([])
}

// Mark a lesson complete — idempotent. Called automatically when the learner
// reaches the last step, so completion needs no dedicated button cluttering the
// player chrome: walking the chapter to its end *is* finishing it.
export const markLessonComplete = (lessonId: string) => {
  const progress = $progress.get()
  if (progress.completedLessons.includes(lessonId)) return
  $progress.set({
    ...progress,
    completedLessons: [...progress.completedLessons, lessonId]
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
export const usePracticeFrame = (): StickersByFace | null => useStore($practiceFrame)
export const usePracticeProgress = (): number => useStore($practiceProgress)
export const useIsPracticeSolved = (): boolean => useStore($isPracticeSolved)
export const useProgress = (): CoachProgress => useStore($progress)
