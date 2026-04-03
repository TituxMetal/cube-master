import { makeValueGuard } from '~/utils/enumGuards'

const FaceMoveMap = {
  U: 'U',
  UPrime: "U'",
  U2: 'U2',
  D: 'D',
  DPrime: "D'",
  D2: 'D2',
  L: 'L',
  LPrime: "L'",
  L2: 'L2',
  R: 'R',
  RPrime: "R'",
  R2: 'R2',
  F: 'F',
  FPrime: "F'",
  F2: 'F2',
  B: 'B',
  BPrime: "B'",
  B2: 'B2'
} as const

export type FaceMove = (typeof FaceMoveMap)[keyof typeof FaceMoveMap]
export type MoveToken = FaceMove
export type BaseFace = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'

export const FACE_MOVES: readonly FaceMove[] = Object.values(FaceMoveMap)

export const isFaceMove = makeValueGuard(FaceMoveMap)
