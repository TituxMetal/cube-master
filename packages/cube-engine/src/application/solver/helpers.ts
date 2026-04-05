import type {
  ColorCode,
  CornerOrientation,
  CornerPositionId,
  CubeState,
  EdgeOrientation,
  EdgePositionId
} from '~/domain'
import { CornerPosition, EdgePosition } from '~/domain/constants'

export const findCorner = (
  state: CubeState,
  colors: [ColorCode, ColorCode, ColorCode]
): { position: CornerPositionId; orientation: CornerOrientation } => {
  const sorted = [...colors].sort().join(',')

  for (const pos of Object.keys(CornerPosition) as CornerPositionId[]) {
    const piece = state.corners[pos]
    const pieceSorted = [...piece.colors].sort().join(',')
    if (pieceSorted === sorted) return { position: pos, orientation: piece.orientation }
  }

  throw new Error(`Corner not found: ${colors.join(',')}`)
}

export const findEdge = (
  state: CubeState,
  colors: [ColorCode, ColorCode]
): { position: EdgePositionId; orientation: EdgeOrientation } => {
  const sorted = [...colors].sort().join(',')

  for (const pos of Object.keys(EdgePosition) as EdgePositionId[]) {
    const piece = state.edges[pos]
    const pieceSorted = [...piece.colors].sort().join(',')
    if (pieceSorted === sorted) return { position: pos, orientation: piece.orientation }
  }

  throw new Error(`Edge not found: ${colors.join(',')}`)
}
