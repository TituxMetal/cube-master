import type {
  CornerOrientation,
  CornerPositionId,
  EdgeOrientation,
  EdgePositionId
} from '../pieces'

import type { BaseFace } from './tokens'

export type PermutationTable = {
  cornerCycle: readonly [CornerPositionId, CornerPositionId, CornerPositionId, CornerPositionId]
  edgeCycle: readonly [EdgePositionId, EdgePositionId, EdgePositionId, EdgePositionId]
  cornerOrientationDeltas: readonly [
    CornerOrientation,
    CornerOrientation,
    CornerOrientation,
    CornerOrientation
  ]
  edgeOrientationDeltas: readonly [
    EdgeOrientation,
    EdgeOrientation,
    EdgeOrientation,
    EdgeOrientation
  ]
}

const U_TABLE: PermutationTable = {
  cornerCycle: ['UFR', 'ULF', 'UBL', 'URB'],
  edgeCycle: ['UF', 'UL', 'UB', 'UR'],
  cornerOrientationDeltas: [0, 0, 0, 0],
  edgeOrientationDeltas: [0, 0, 0, 0]
}
const D_TABLE: PermutationTable = {
  cornerCycle: ['DFR', 'DRB', 'DBL', 'DLF'],
  edgeCycle: ['DF', 'DR', 'DB', 'DL'],
  cornerOrientationDeltas: [0, 0, 0, 0],
  edgeOrientationDeltas: [0, 0, 0, 0]
}
const R_TABLE: PermutationTable = {
  cornerCycle: ['UFR', 'URB', 'DRB', 'DFR'],
  edgeCycle: ['UR', 'BR', 'DR', 'FR'],
  cornerOrientationDeltas: [1, 2, 1, 2],
  edgeOrientationDeltas: [0, 0, 0, 0]
}
const L_TABLE: PermutationTable = {
  cornerCycle: ['ULF', 'DLF', 'DBL', 'UBL'],
  edgeCycle: ['UL', 'FL', 'DL', 'BL'],
  cornerOrientationDeltas: [2, 1, 2, 1],
  edgeOrientationDeltas: [0, 0, 0, 0]
}
const F_TABLE: PermutationTable = {
  cornerCycle: ['UFR', 'DFR', 'DLF', 'ULF'],
  edgeCycle: ['UF', 'FR', 'DF', 'FL'],
  cornerOrientationDeltas: [2, 1, 2, 1],
  edgeOrientationDeltas: [1, 1, 1, 1]
}
const B_TABLE: PermutationTable = {
  cornerCycle: ['URB', 'UBL', 'DBL', 'DRB'],
  edgeCycle: ['UB', 'BL', 'DB', 'BR'],
  cornerOrientationDeltas: [1, 2, 1, 2],
  edgeOrientationDeltas: [1, 1, 1, 1]
}

export const MOVE_TABLES: Record<BaseFace, PermutationTable> = {
  U: U_TABLE,
  D: D_TABLE,
  R: R_TABLE,
  L: L_TABLE,
  F: F_TABLE,
  B: B_TABLE
}
