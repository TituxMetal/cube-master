import type { CubeState, MoveToken } from '~/domain'
import { applyMove } from '~/domain'

export const applyMoves = (state: CubeState, moves: readonly MoveToken[]): CubeState => {
  return moves.reduce((s, m) => applyMove(s, m), state)
}
