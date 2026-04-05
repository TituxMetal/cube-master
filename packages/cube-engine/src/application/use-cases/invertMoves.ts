import type { MoveToken } from '~/domain'

const INVERSE_MAP: Record<MoveToken, MoveToken> = {
  U: "U'",
  "U'": 'U',
  U2: 'U2',
  D: "D'",
  "D'": 'D',
  D2: 'D2',
  R: "R'",
  "R'": 'R',
  R2: 'R2',
  L: "L'",
  "L'": 'L',
  L2: 'L2',
  F: "F'",
  "F'": 'F',
  F2: 'F2',
  B: "B'",
  "B'": 'B',
  B2: 'B2'
}

export const invertMove = (move: MoveToken): MoveToken => INVERSE_MAP[move]

export const invertMoves = (moves: readonly MoveToken[]): MoveToken[] =>
  [...moves].reverse().map(invertMove)
