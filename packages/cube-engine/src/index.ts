// Domain — types
export type {
  ColorCode,
  FaceCode,
  CornerPositionId,
  EdgePositionId,
  CornerOrientation,
  EdgeOrientation,
  CornerPiece,
  EdgePiece,
  CubeState,
  FaceMove,
  MoveToken,
  BaseFace,
  PermutationTable,
  StickerIndex,
  StickerMapping
} from './domain'

// Domain — algorithm catalog
export type { AlgorithmEntry, AlgorithmMethod } from './domain'
export { ALGORITHM_CATALOG, getAlgorithm } from './domain'

// Domain — values
export {
  Color,
  Face,
  CornerPosition,
  EdgePosition,
  isColor,
  isFace,
  isCornerPosition,
  isEdgePosition,
  stickerMapping,
  faceIndexInId,
  FACE_MOVES,
  isFaceMove,
  MOVE_TABLES,
  applyMove,
  makeCornerPiece,
  makeEdgePiece,
  makeSolvedCornerPiece,
  makeSolvedEdgePiece
} from './domain'

// Application
export { createSolvedState } from './application/use-cases/createSolvedState'
export { applyMoves } from './application/use-cases/applyMoves'
export { generateScramble } from './application/use-cases/generateScramble'
export type { RandomSource } from './application/use-cases/generateScramble'
export { reconstructState } from './application/use-cases/reconstructState'
export type { ReconstructResult } from './application/use-cases/reconstructState'
export { invertMove, invertMoves } from './application/use-cases/invertMoves'
export { solveCube } from './application/use-cases/solveCube'
export type { MoveGroup, Solution, SolvePhase } from './application/solver/types'

// Application — Coach teaching solver (pure, sibling to solver/)
export type {
  TeachingSegment,
  TeachingSegmentKind,
  TeachingStepGroup,
  TeachingPlan
} from './application/teaching'
export { flattenTeachingPlan, planWhiteCorners } from './application/teaching'

// Infrastructure
export { toStickers } from './infrastructure/render/toStickers'
export type { StickersByFace } from './infrastructure/render/toStickers'
