import type { Color, Face, CornerPosition, EdgePosition } from './constants'

export type ColorCode = (typeof Color)[keyof typeof Color]
export type FaceCode = (typeof Face)[keyof typeof Face]
export type CornerPositionId = keyof typeof CornerPosition
export type EdgePositionId = keyof typeof EdgePosition
export type CornerOrientation = 0 | 1 | 2
export type EdgeOrientation = 0 | 1
export type CornerPiece = {
  id: CornerPositionId
  position: CornerPositionId
  orientation: CornerOrientation
  colors: [ColorCode, ColorCode, ColorCode]
}
export type EdgePiece = {
  id: EdgePositionId
  position: EdgePositionId
  orientation: EdgeOrientation
  colors: [ColorCode, ColorCode]
}

export const makeCornerPiece = (
  id: CornerPositionId,
  position: CornerPositionId,
  colors: [ColorCode, ColorCode, ColorCode],
  orientation = 0 as CornerOrientation
): CornerPiece => {
  if (colors.length !== 3) {
    throw new Error('Corner piece must have exactly three colors')
  }

  return { id, position, orientation, colors }
}

export const makeEdgePiece = (
  id: EdgePositionId,
  position: EdgePositionId,
  colors: [ColorCode, ColorCode],
  orientation = 0 as EdgeOrientation
): EdgePiece => {
  if (colors.length !== 2) {
    throw new Error('Edge piece must have exactly two colors')
  }

  return { id, position, orientation, colors }
}

export const makeSolvedCornerPiece = (
  id: CornerPositionId,
  colors: [ColorCode, ColorCode, ColorCode]
) => makeCornerPiece(id, id, colors, 0)

export const makeSolvedEdgePiece = (id: EdgePositionId, colors: [ColorCode, ColorCode]) =>
  makeEdgePiece(id, id, colors, 0)
