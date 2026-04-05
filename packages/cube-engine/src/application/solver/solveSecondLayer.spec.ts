import { describe, expect, it } from 'bun:test'

import type { CubeState, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import { toStickers } from '~/infrastructure/render/toStickers'

import { applyMoves } from '../use-cases/applyMoves'
import { createSolvedState } from '../use-cases/createSolvedState'

import { solveSecondLayer } from './solveSecondLayer'
import { solveWhiteCorners } from './solveWhiteCorners'
import { solveWhiteCross } from './solveWhiteCross'

const verifyF2L = (state: CubeState) => {
  const stickers = toStickers(state)

  // U face all white
  for (let i = 0; i < 9; i++) {
    expect(stickers.U[i]).toBe(Color.White)
  }

  // First two rows of each side face match center
  const sideFaces = ['F', 'R', 'B', 'L'] as const
  for (const face of sideFaces) {
    const center = stickers[face][4]
    // Top row (0, 1, 2) and middle row (3, 4, 5) should match center
    for (const idx of [0, 1, 2, 3, 5]) {
      expect(stickers[face][idx]).toBe(center)
    }
  }
}

const solveF2L = (scramble: MoveToken[]) => {
  let state = applyMoves(createSolvedState(), scramble)
  state = solveWhiteCross(state).state
  state = solveWhiteCorners(state).state
  return solveSecondLayer(state)
}

describe('solveSecondLayer', () => {
  it('should return 0 moves for already solved second layer', () => {
    const state = createSolvedState()
    const result = solveSecondLayer(state)

    expect(result.moves).toHaveLength(0)
  })

  it('should solve second layer after first layer on a simple scramble', () => {
    const result = solveF2L(['D', 'R', "F'"])

    verifyF2L(result.state)
  })

  it('should solve edge in D layer (insert right)', () => {
    const result = solveF2L(['D', 'R', "D'", "R'", "D'", "F'", 'D', 'F'])

    verifyF2L(result.state)
  })

  it('should solve edge in wrong middle position', () => {
    // Scramble that puts a middle edge in the wrong slot
    const result = solveF2L(["F'", 'D', 'F', 'D', 'R', "D'", "R'"])

    verifyF2L(result.state)
  })

  it('should solve full scramble second layer', () => {
    const scramble: MoveToken[] = [
      'R',
      'U',
      "F'",
      'D2',
      'L',
      "B'",
      'R2',
      'U',
      'D',
      "L'",
      'F',
      'B',
      "R'",
      'U2',
      'D',
      'F2',
      "B'",
      'L',
      "R'",
      'U'
    ]
    const result = solveF2L(scramble)

    verifyF2L(result.state)
  })

  it('should solve multiple scrambles', () => {
    const scrambles: MoveToken[][] = [
      ['R', "U'", 'F2', 'D', "L'"],
      ["B'", 'R2', 'U', 'F', "D'", 'L'],
      ['U2', "R'", 'F', 'D2', 'B', "L'", 'U', 'R'],
      ['F', 'R', 'U', "B'", "D'", 'L2', "F'", 'R', 'D'],
      ["U'", "F'", 'R2', "B'", 'D2', 'L', 'U', "R'", "F'", 'D']
    ]

    for (const scramble of scrambles) {
      const result = solveF2L(scramble)
      verifyF2L(result.state)
    }
  })
})
