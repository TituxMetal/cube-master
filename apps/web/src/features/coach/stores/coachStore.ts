import { useStore } from '@nanostores/react'
import type {
  CubeState,
  FaceCode,
  MoveToken,
  StickersByFace,
  TeachingSegment
} from '@packages/cube-engine'
import {
  applyMoves,
  collapseTeachingSetups,
  createSolvedState,
  getAlgorithm,
  invertMoves,
  planOrientLastCorners,
  planPermuteLastEdges,
  planPlaceLastCorners,
  planSecondLayer,
  planWhiteCorners,
  planYellowCross,
  toStickers
} from '@packages/cube-engine'
import { atom, computed } from 'nanostores'

import {
  crossMisalignedState,
  secondLayerState,
  whiteCornersState,
  whiteCrossOnlyState,
  yellowCornersOrientedState,
  yellowCornersPlacedState,
  yellowCrossState
} from '~/features/coach/data/illustrative'
import { getLesson } from '~/features/coach/data/lessons'
import type {
  GoalState,
  IllustrativeState,
  Lesson,
  LessonStep,
  StepVisual,
  TeachingScenario
} from '~/features/coach/data/types'
import { isTeachingDemo } from '~/features/coach/data/types'
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
  if (state === 'white-corners') return whiteCornersState()
  if (state === 'second-layer') return secondLayerState()
  if (state === 'yellow-cross') return yellowCrossState()
  if (state === 'yellow-corners-oriented') return yellowCornersOrientedState()
  if (state === 'yellow-corners-placed') return yellowCornersPlacedState()
  return createSolvedState()
}

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

// Single-tab assumption: concurrent writes from two tabs are last-write-wins. See ADR-0007.
$progress.listen(progressStorage.save)

// --- computed ---

export const $currentLesson = computed($currentLessonId, (id): Lesson | null =>
  id === null ? null : (getLesson(id) ?? null)
)

export const $currentStep = computed(
  [$currentLesson, $lessonStepIndex],
  (lesson, index): LessonStep | null => lesson?.steps[index] ?? null
)

// Run a teaching scenario's planner on its `from` milestone. The single source of
// the moves a teaching demo / chapter practice replays — the engine, never inline
// data (NFR-004). Phase 37 extends the switch with the remaining last-layer phases.
const runTeachingPlan = (scenario: TeachingScenario) => {
  const start = namedState(scenario.from)
  if (scenario.phase === 'white-corners') return planWhiteCorners(start, createSolvedState())
  if (scenario.phase === 'second-layer') return planSecondLayer(start)
  if (scenario.phase === 'yellow-cross') return planYellowCross(start)
  if (scenario.phase === 'orient-corners') return planOrientLastCorners(start)
  if (scenario.phase === 'place-corners') return planPlaceLastCorners(start)
  return planPermuteLastEdges(start)
}

// A step's resolved recipe — the unifying shape behind every demo/practice variant,
// legacy or teaching. `moves` is what the learner steps through or taps; `base` is
// the starting cube; `successState` is the practice target (null for demos);
// `segments` carries setup/trigger boundaries for highlighting (teaching only).
type StepRecipe = {
  moves: readonly MoveToken[]
  base: CubeState
  successState: CubeState | null
  segments: readonly TeachingSegment[] | null
}

const EMPTY_RECIPE = (): StepRecipe => ({
  moves: [],
  base: createSolvedState(),
  successState: null,
  segments: null
})

// Legacy case base: the goal milestone with the algorithm's footprint reversed, so
// the surrounding layers stay scrambled and the algorithm lands back on it.
const legacyCaseBase = (goal: GoalState, moves: readonly MoveToken[]): CubeState =>
  applyMoves(namedState(goal), invertMoves([...moves]))

const resolveRecipe = (step: LessonStep | null): StepRecipe => {
  if (step === null || step.kind === 'understand' || step.kind === 'interactive') {
    return EMPTY_RECIPE()
  }

  if (step.kind === 'chapter-practice') {
    const plan = runTeachingPlan(step.scenario)
    // Collapse the seams between groups (one corner's closing restore meets the next
    // corner's opening placement) so the chained recipe shows no U U' / U2 U2 no-ops.
    // Triggers are untouched, so the net cube transform — and the milestone it lands
    // on — is unchanged. Moves derive from the same segments the markers read.
    const segments = collapseTeachingSetups(plan.groups.flatMap(group => group.segments))
    return {
      moves: segments.flatMap(segment => [...segment.moves]),
      base: namedState(step.scenario.from),
      successState: namedState(step.scenario.to),
      segments
    }
  }

  if (step.kind === 'demo' && isTeachingDemo(step)) {
    const plan = runTeachingPlan(step.scenario)
    const before = plan.groups.slice(0, step.groupIndex)
    const group = plan.groups[step.groupIndex]
    const segments = group?.segments ?? []
    return {
      moves: segments.flatMap(segment => [...segment.moves]),
      base: applyMoves(
        namedState(step.scenario.from),
        before.flatMap(g => g.segments.flatMap(s => [...s.moves]))
      ),
      successState: null,
      segments
    }
  }

  // Legacy single-algorithm demo or practice.
  const moves = getAlgorithm(step.algorithmId)?.moves ?? []
  const goal = step.goal ?? 'solved'
  if (step.kind === 'demo') {
    const base =
      (step.demoFrom ?? 'case') === 'case' ? legacyCaseBase(goal, moves) : namedState(goal)
    return { moves, base, successState: null, segments: null }
  }
  return {
    moves,
    base: legacyCaseBase(goal, moves),
    successState: namedState(goal),
    segments: null
  }
}

// The current step's recipe — recomputed only when the step changes (the planner
// runs once per step view, not per playback tick).
export const $stepRecipe = computed($currentStep, resolveRecipe)

// The move sequence the current step teaches — shown as notation so the learner
// reads the moves (R, D, R′ …), not just the animated cube.
export const $currentStepMoves = computed(
  $stepRecipe,
  (recipe): readonly MoveToken[] => recipe.moves
)

export const $playbackTotal = computed($currentStepMoves, (moves): number => moves.length)

// French gesture labels for the trigger badge — the catalog names are English (code
// stays EN), but the learner-facing player must read in French. Falls back to a plain
// word rather than leaking an English algorithm name into the UI.
const GESTURE_LABELS: Record<string, string> = {
  'sexy-move': 'Sexy move',
  'sexy-move-mirror': 'Miroir',
  'second-layer-insert-right': 'Insert droite',
  'second-layer-insert-left': 'Insert gauche',
  'second-layer-insert-front-left': 'Insert avant-gauche',
  'second-layer-insert-back-right': 'Insert arrière-droite',
  'second-layer-insert-back-left': 'Insert arrière-gauche',
  'yellow-cross-line': 'La barre',
  'yellow-cross-l': 'Le L',
  sune: 'Sune',
  'anti-sune': 'Anti-Sune',
  'corner-3-cycle': 'Cycle des coins',
  'a-perm': 'Cycle des coins',
  'edge-3-cycle': 'Cycle des arêtes'
}

// A per-move marker so the player can label setup ("Placement") vs trigger (the
// named gesture) segments along the recipe. Empty for legacy steps (no segments).
export type SegmentMarker = { kind: 'setup' | 'trigger'; label: string }
export const $stepSegmentMarkers = computed($stepRecipe, (recipe): readonly SegmentMarker[] => {
  if (!recipe.segments) return []
  const markers: SegmentMarker[] = []
  for (const segment of recipe.segments) {
    const label =
      segment.kind === 'trigger'
        ? (GESTURE_LABELS[segment.catalogId ?? ''] ?? 'Geste')
        : 'Placement'
    for (let i = 0; i < segment.moves.length; i++) markers.push({ kind: segment.kind, label })
  }
  return markers
})

// The cube frame for a *demo* step at the current playback index — the one the
// learner watches the app step through, from the recipe's base forward.
// (D-DEMO-DECOUPLE / the milestone-demo model)
export const $demoFrame = computed(
  [$currentStep, $stepRecipe, $playbackIndex],
  (step, recipe, index): StickersByFace | null => {
    if (step === null || step.kind !== 'demo') return null
    return toStickers(applyMoves(recipe.base, [...recipe.moves.slice(0, index)]))
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

// Both practice kinds drive their cube from the learner's taps: legacy single-
// algorithm `practice` (Ch1) and the full-chapter `chapter-practice` (PD-3).
const isPracticeKind = (step: LessonStep | null): boolean =>
  step?.kind === 'practice' || step?.kind === 'chapter-practice'

// The live cube for a practice step — the recipe's base plus every move the learner
// has tapped. They *execute* the recipe; the cube responds, so practice is genuinely
// "your turn", not a second viewing of the demo. (PD6 / PD-3)
export const $practiceFrame = computed(
  [$currentStep, $stepRecipe, $practiceMoves],
  (step, recipe, moves): StickersByFace | null =>
    isPracticeKind(step) ? toStickers(applyMoves(recipe.base, moves)) : null
)

// How many of the learner's leading taps match the recipe so far — drives the
// recipe highlight and the next-move hint, and stops at the first wrong tap so a
// mistake shows immediately instead of silently counting. Length-agnostic, so it
// scales from one algorithm to a whole-chapter recipe unchanged.
export const $practiceProgress = computed(
  [$currentStep, $stepRecipe, $practiceMoves],
  (step, recipe, taps): number => {
    if (!isPracticeKind(step)) return 0
    const expected = recipe.moves
    let matched = 0
    while (
      matched < taps.length &&
      matched < expected.length &&
      taps[matched] === expected[matched]
    )
      matched++
    return matched
  }
)

const stickersEqual = (a: StickersByFace, b: StickersByFace): boolean =>
  (['U', 'D', 'F', 'B', 'L', 'R'] as const).every(face =>
    a[face].every((color, i) => color === b[face][i])
  )

// Practice success = the learner's executed moves bring the base to the recipe's
// success milestone (Decision D4 / D-PRACTICE-SOLVER). For chapter practice that is
// this chapter's milestone reached from the previous one; for a legacy practice it
// is the algorithm's goal reached from its case.
export const $isPracticeSolved = computed(
  [$currentStep, $stepRecipe, $practiceFrame],
  (step, recipe, frame): boolean =>
    isPracticeKind(step) &&
    frame !== null &&
    recipe.successState !== null &&
    stickersEqual(frame, toStickers(recipe.successState))
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
export const useStepSegmentMarkers = (): readonly SegmentMarker[] => useStore($stepSegmentMarkers)
export const useDemoFrame = (): StickersByFace | null => useStore($demoFrame)
export const useUnderstandVisual = (): UnderstandVisual | null => useStore($understandVisual)
export const useInteractiveFrame = (): StickersByFace => useStore($interactiveFrame)
export const useInteractiveMoves = (): MoveToken[] => useStore($interactiveMoves)
export const usePracticeFrame = (): StickersByFace | null => useStore($practiceFrame)
export const usePracticeProgress = (): number => useStore($practiceProgress)
export const useIsPracticeSolved = (): boolean => useStore($isPracticeSolved)
export const useProgress = (): CoachProgress => useStore($progress)
