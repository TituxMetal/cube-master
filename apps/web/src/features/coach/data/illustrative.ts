import type { CubeState, MoveToken, StickersByFace } from '@packages/cube-engine'
import { applyMoves, createSolvedState, solveCube, toStickers } from '@packages/cube-engine'

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
}

let cache: Milestones | null = null

const compute = (): Milestones => {
  const scrambled = applyMoves(createSolvedState(), FIXED_SCRAMBLE)
  const solution = solveCube(scrambled)
  // Replay solver phases [0..k) from the scrambled cube — phase order is
  // White Cross, White Corners, Second Layer, Yellow Cross, Yellow Layer.
  const afterPhases = (count: number): CubeState =>
    applyMoves(
      scrambled,
      solution.phases.slice(0, count).flatMap(phase => phase.groups.flatMap(group => group.moves))
    )

  const whiteCrossOnly = afterPhases(1)

  return {
    whiteCrossOnly,
    // A U turn leaves the white cross on top but rotates the side bands off their
    // centres — the classic "looks like a cross but the sides don't follow" state.
    crossMisaligned: applyMoves(whiteCrossOnly, ['U']),
    whiteCorners: afterPhases(2),
    secondLayer: afterPhases(3),
    yellowCross: afterPhases(4)
  }
}

const milestones = (): Milestones => (cache ??= compute())

// CubeState milestones — the store builds a case demo as applyMoves(milestone,
// invertMoves(alg)), so it needs the state, not just the stickers.
export const whiteCrossOnlyState = (): CubeState => milestones().whiteCrossOnly
export const crossMisalignedState = (): CubeState => milestones().crossMisaligned
export const whiteCornersState = (): CubeState => milestones().whiteCorners
export const secondLayerState = (): CubeState => milestones().secondLayer
export const yellowCrossState = (): CubeState => milestones().yellowCross

// Sticker projections — for understand visuals (the player renders stickers).
export const whiteCrossOnly = (): StickersByFace => toStickers(whiteCrossOnlyState())
export const crossMisaligned = (): StickersByFace => toStickers(crossMisalignedState())
