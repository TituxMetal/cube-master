import type { CubeState, MoveToken, StickersByFace } from '@packages/cube-engine'
import {
  applyMoves,
  createSolvedState,
  flattenTeachingPlan,
  planOrientLastCorners,
  planPlaceLastCorners,
  planSecondLayer,
  planWhiteCorners,
  planYellowCross,
  solveCube,
  toStickers
} from '@packages/cube-engine'

// Real, reachable illustrative cube states + per-chapter milestones — so Coach
// shows a *meaningful partial* cube (the white cross actually standing out on an
// otherwise mixed cube, the first layer done with the top still scrambled, …)
// instead of a fully solved cube, which reads as pointless. A demo/practice anchors
// on its chapter's milestone (PD6): the case is the milestone with the algorithm's
// footprint reversed, so the surrounding layers stay scrambled and the algorithm
// lands exactly back on the milestone.
//
// Each milestone comes from a *real* solve: scramble with a fixed sequence, solve
// it, and replay only the solver phases up to that chapter. The result is
// guaranteed reachable (no hand-built impossible cube) and stays in the app's
// white-on-top frame. The last-layer chapters resolve to 'solved' instead (the
// first two layers are genuinely complete there) — see GoalState. Computed lazily +
// memoised so nothing costs anything until a lesson opens.
const FIXED_SCRAMBLE: MoveToken[] = [
  'R',
  'U2',
  "F'",
  'L',
  'D',
  'B2',
  "R'",
  'U',
  'F2',
  "D'",
  'L2',
  'B',
  "U'",
  'R2',
  'F'
]

type Milestones = {
  whiteCrossOnly: CubeState
  crossMisaligned: CubeState
  whiteCorners: CubeState
  secondLayer: CubeState
  yellowCross: CubeState
  yellowCornersOriented: CubeState
  yellowCornersPlaced: CubeState
}

let cache: Milestones | null = null

const advance = (from: CubeState, plan: ReturnType<typeof planSecondLayer>): CubeState =>
  applyMoves(from, [...flattenTeachingPlan(plan)])

// Last-resort milestones if the chained solve/planner computation throws — every
// chapter falls back to a solved cube. A wrong (but valid) cube degrades the
// illustrative visuals; it does not crash the Coach route. Each field is its own
// state so nothing is shared by reference.
const fallbackMilestones = (): Milestones => ({
  whiteCrossOnly: createSolvedState(),
  crossMisaligned: createSolvedState(),
  whiteCorners: createSolvedState(),
  secondLayer: createSolvedState(),
  yellowCross: createSolvedState(),
  yellowCornersOriented: createSolvedState(),
  yellowCornersPlaced: createSolvedState()
})

// Run the milestone computation; on any throw, log and degrade to solved-cube
// fallbacks. The fixed scramble is deterministic and tested, so this only fires on a
// future solver/planner regression — and the caller memoises the result, so a
// regression shows wrong visuals instead of permanently breaking every lesson open
// (no rethrow loop). `primary`/`fallback` are injectable so the degrade-on-throw
// contract is unit-testable (#15/#18) without mocking the engine or the module cache.
export const computeMilestonesOrFallback = (
  primary: () => Milestones = computeMilestones,
  fallback: () => Milestones = fallbackMilestones
): Milestones => {
  try {
    return primary()
  } catch (err) {
    console.error('illustrative: milestone computation failed; falling back to solved cubes', err)
    return fallback()
  }
}

const computeMilestones = (): Milestones => {
  const scrambled = applyMoves(createSolvedState(), FIXED_SCRAMBLE)
  const solution = solveCube(scrambled)
  // Only the white cross comes from the shared solver (Ch1 is untouched legacy). Every
  // later milestone is built by **chaining the teaching solver** off the previous one
  // (D-MILESTONES-FROM-TEACHING, extended to the whole journey): so each chapter's
  // full-chapter practice, which replays that planner from the previous milestone,
  // lands *exactly* on this state (stickersEqual success). The shared solver churns the
  // lower layers differently and would never match the teaching recipe.
  const whiteCrossOnly = applyMoves(
    scrambled,
    solution.phases.slice(0, 1).flatMap(phase => phase.groups.flatMap(group => group.moves))
  )
  const solved = createSolvedState()

  const whiteCorners = advance(whiteCrossOnly, planWhiteCorners(whiteCrossOnly, solved))
  const secondLayer = advance(whiteCorners, planSecondLayer(whiteCorners))
  const yellowCross = advance(secondLayer, planYellowCross(secondLayer))
  const yellowCornersOriented = advance(yellowCross, planOrientLastCorners(yellowCross))
  const yellowCornersPlaced = advance(
    yellowCornersOriented,
    planPlaceLastCorners(yellowCornersOriented)
  )

  return {
    whiteCrossOnly,
    // A U turn leaves the white cross on top but rotates the side bands off their
    // centres — the classic "looks like a cross but the sides don't follow" state.
    crossMisaligned: applyMoves(whiteCrossOnly, ['U']),
    whiteCorners,
    secondLayer,
    yellowCross,
    yellowCornersOriented,
    yellowCornersPlaced
  }
}

const milestones = (): Milestones => (cache ??= computeMilestonesOrFallback())

// Eagerly fill the memoised cache. The first milestone access runs solveCube on the
// fixed scramble (~420ms on the main thread); calling this from the Coach route during
// idle time means the first lesson's first demo hits a warm cache instead of paying
// that cost mid-click (#17). Idempotent — a second call is a cheap cache hit.
export const warmMilestones = (): void => {
  milestones()
}

// CubeState milestones — the store builds a case demo as applyMoves(milestone,
// invertMoves(alg)), so it needs the state, not just the stickers.
export const whiteCrossOnlyState = (): CubeState => milestones().whiteCrossOnly
export const crossMisalignedState = (): CubeState => milestones().crossMisaligned
export const whiteCornersState = (): CubeState => milestones().whiteCorners
export const secondLayerState = (): CubeState => milestones().secondLayer
export const yellowCrossState = (): CubeState => milestones().yellowCross
export const yellowCornersOrientedState = (): CubeState => milestones().yellowCornersOriented
export const yellowCornersPlacedState = (): CubeState => milestones().yellowCornersPlaced

// Sticker projections — for understand visuals (the player renders stickers).
export const whiteCrossOnly = (): StickersByFace => toStickers(whiteCrossOnlyState())
export const crossMisaligned = (): StickersByFace => toStickers(crossMisalignedState())
