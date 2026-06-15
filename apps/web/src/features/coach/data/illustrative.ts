import type { MoveToken, StickersByFace } from '@packages/cube-engine'
import { applyMoves, createSolvedState, solveCube, toStickers } from '@packages/cube-engine'

// Real, reachable illustrative cube states for `understand` visuals — so Coach
// shows a *meaningful partial* cube (the white cross actually standing out on an
// otherwise mixed cube) instead of a fully solved cube, which reads as pointless.
//
// We get a genuine "white cross done, rest scrambled" state by scrambling with a
// fixed sequence, solving it, and replaying only the solver's White-Cross phase.
// The result is guaranteed reachable (no hand-built impossible cube) and stays in
// the app's white-on-top frame. Computed lazily + memoised so it never costs
// anything until a lesson that uses it is opened.
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

type IllustrativeStickers = {
  whiteCrossOnly: StickersByFace
  crossMisaligned: StickersByFace
}

let cache: IllustrativeStickers | null = null

const compute = (): IllustrativeStickers => {
  const scrambled = applyMoves(createSolvedState(), FIXED_SCRAMBLE)
  const solution = solveCube(scrambled)
  const crossMoves = solution.phases[0].groups.flatMap(group => group.moves)
  const afterCross = applyMoves(scrambled, crossMoves)

  return {
    whiteCrossOnly: toStickers(afterCross),
    // A U turn leaves the white cross on top but rotates the side bands off their
    // centres — the classic "looks like a cross but the sides don't follow" state.
    crossMisaligned: toStickers(applyMoves(afterCross, ['U']))
  }
}

const illustrative = (): IllustrativeStickers => (cache ??= compute())

export const whiteCrossOnly = (): StickersByFace => illustrative().whiteCrossOnly
export const crossMisaligned = (): StickersByFace => illustrative().crossMisaligned
