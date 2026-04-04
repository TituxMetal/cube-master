import { describe, expect, it } from 'bun:test'

import { isFaceMove } from '~/domain/moves/tokens'
import type { BaseFace } from '~/domain/moves/tokens'

import { generateScramble } from './generateScramble'

const OPPOSITE_FACES: Record<BaseFace, BaseFace> = {
  U: 'D',
  D: 'U',
  F: 'B',
  B: 'F',
  L: 'R',
  R: 'L'
}

const createSeededRandom = (seed: number) => {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

describe('Use Case - generateScramble', () => {
  it('should return exactly 20 moves by default', () => {
    const moves = generateScramble()

    expect(moves).toHaveLength(20)
  })

  it('should return custom length', () => {
    const moves = generateScramble(10)

    expect(moves).toHaveLength(10)
  })

  it('should only contain valid face moves', () => {
    const moves = generateScramble(50, createSeededRandom(42))

    moves.forEach(move => {
      expect(isFaceMove(move)).toBe(true)
    })
  })

  it('should not have consecutive moves on the same face', () => {
    const moves = generateScramble(50, createSeededRandom(123))

    for (let i = 1; i < moves.length; i++) {
      expect(moves[i][0]).not.toBe(moves[i - 1][0])
    }
  })

  it('should not have A-B-A pattern on opposite faces', () => {
    const moves = generateScramble(50, createSeededRandom(456))

    for (let i = 2; i < moves.length; i++) {
      const face = moves[i][0] as BaseFace
      const prevFace = moves[i - 1][0] as BaseFace
      const prevPrevFace = moves[i - 2][0] as BaseFace

      if (face === prevPrevFace) {
        expect(OPPOSITE_FACES[face]).not.toBe(prevFace)
      }
    }
  })

  it('should be deterministic with seeded random', () => {
    const a = generateScramble(20, createSeededRandom(999))
    const b = generateScramble(20, createSeededRandom(999))

    expect(a).toEqual(b)
  })

  it('should produce different results with different seeds', () => {
    const a = generateScramble(20, createSeededRandom(1))
    const b = generateScramble(20, createSeededRandom(2))

    expect(a).not.toEqual(b)
  })
})
