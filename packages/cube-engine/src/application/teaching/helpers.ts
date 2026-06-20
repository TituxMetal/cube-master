import type { ColorCode, CornerPositionId, CubeState, EdgePositionId, MoveToken } from '~/domain'
import { CornerPosition, EdgePosition } from '~/domain/constants'

// Pure local helpers for the teaching solver — kept here (not imported from
// solver/helpers) so the teaching module stays independent of Solver mode.

// The home position of the corner carrying these three colours, by colour-set
// match (position-independent). Throws if absent — a malformed cube, not a case.
export const findCornerByColors = (
  state: CubeState,
  colors: readonly [ColorCode, ColorCode, ColorCode]
): CornerPositionId => {
  const sorted = [...colors].sort().join(',')
  for (const pos of Object.keys(CornerPosition) as CornerPositionId[]) {
    if ([...state.corners[pos].colors].sort().join(',') === sorted) return pos
  }
  throw new Error(`Corner not found: ${colors.join(',')}`)
}

// Whether the piece at `pos` is its home corner, correctly oriented.
export const isCornerHome = (state: CubeState, pos: CornerPositionId): boolean =>
  state.corners[pos].id === pos && state.corners[pos].orientation === 0

// The home position + orientation of the edge carrying these two colours.
export const findEdgeByColors = (
  state: CubeState,
  colors: readonly [ColorCode, ColorCode]
): { position: EdgePositionId; orientation: number } => {
  const sorted = [...colors].sort().join(',')
  for (const pos of Object.keys(EdgePosition) as EdgePositionId[]) {
    const piece = state.edges[pos]
    if ([...piece.colors].sort().join(',') === sorted) {
      return { position: pos, orientation: piece.orientation }
    }
  }
  throw new Error(`Edge not found: ${colors.join(',')}`)
}

// Whether the piece at `pos` is its home edge, correctly oriented.
export const isEdgeHome = (state: CubeState, pos: EdgePositionId): boolean =>
  state.edges[pos].id === pos && state.edges[pos].orientation === 0

// Invert a run of U turns (for the closing "restore" placement). Pure on U tokens.
export const invertUTurns = (moves: readonly MoveToken[]): MoveToken[] =>
  moves.map(m => (m === 'U' ? "U'" : m === "U'" ? 'U' : 'U2'))
