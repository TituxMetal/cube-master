import type { BaseFace, MoveToken } from '~/domain/moves/tokens'
import { FACE_MOVES } from '~/domain/moves/tokens'

export type RandomSource = () => number

const OPPOSITE_FACES: Record<BaseFace, BaseFace> = {
  U: 'D',
  D: 'U',
  F: 'B',
  B: 'F',
  L: 'R',
  R: 'L'
}

export const generateScramble = (length = 20, random: RandomSource = Math.random): MoveToken[] => {
  const moves: MoveToken[] = []
  let lastFace: BaseFace | null = null
  let secondLastFace: BaseFace | null = null

  while (moves.length < length) {
    const move = FACE_MOVES[Math.floor(random() * FACE_MOVES.length)]
    const face = move[0] as BaseFace

    if (face === lastFace) continue
    if (face === secondLastFace && OPPOSITE_FACES[face] === lastFace) continue

    moves.push(move)
    secondLastFace = lastFace
    lastFace = face
  }

  return moves
}
