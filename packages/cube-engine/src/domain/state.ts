import type {
  CornerPiece,
  EdgePiece,
  CornerPositionId,
  EdgePositionId,
  FaceCode,
  ColorCode
} from './pieces'

export type CubeState = {
  corners: Record<CornerPositionId, CornerPiece>
  edges: Record<EdgePositionId, EdgePiece>
  centers: Record<FaceCode, ColorCode>
}
