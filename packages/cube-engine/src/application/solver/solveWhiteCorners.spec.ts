import { describe, expect, it } from 'bun:test'

import type { CubeState, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import { toStickers } from '~/infrastructure/render/toStickers'

import { applyMoves } from '../use-cases/applyMoves'
import { createSolvedState } from '../use-cases/createSolvedState'

import { solveWhiteCorners } from './solveWhiteCorners'
import { solveWhiteCross } from './solveWhiteCross'

const verifyWhiteCorners = (state: CubeState) => {
  const stickers = toStickers(state)

  // Entire U face should be white
  for (let i = 0; i < 9; i++) {
    expect(stickers.U[i]).toBe(Color.White)
  }

  // Top row of each side face should match its center
  expect(stickers.F[0]).toBe(stickers.F[4]) // ULF on F
  expect(stickers.F[2]).toBe(stickers.F[4]) // UFR on F
  expect(stickers.R[0]).toBe(stickers.R[4]) // UFR on R
  expect(stickers.R[2]).toBe(stickers.R[4]) // URB on R
  expect(stickers.B[0]).toBe(stickers.B[4]) // URB on B
  expect(stickers.B[2]).toBe(stickers.B[4]) // UBL on B
  expect(stickers.L[0]).toBe(stickers.L[4]) // UBL on L
  expect(stickers.L[2]).toBe(stickers.L[4]) // ULF on L
}

const solveFirstLayer = (scramble: MoveToken[]) => {
  let state = applyMoves(createSolvedState(), scramble)
  state = solveWhiteCross(state).state
  return solveWhiteCorners(state)
}

describe('solveWhiteCorners', () => {
  it('should return 0 moves for already solved corners', () => {
    const state = createSolvedState()
    const result = solveWhiteCorners(state)

    expect(result.moves).toHaveLength(0)
  })

  it('should solve corners after white cross on a simple scramble', () => {
    const result = solveFirstLayer(['R', 'U', "F'"])

    verifyWhiteCorners(result.state)
  })

  it('should solve corners with piece in D layer (3 orientations)', () => {
    const scrambles: MoveToken[][] = [
      ["R'", 'D', 'R'], // corner extracted with orientation 0
      ["R'", "D'", 'R', 'D', "R'", "D'", 'R'], // orientation 1
      ["R'", "D'", 'R', 'D', "R'", "D'", 'R', 'D', "R'", "D'", 'R'] // orientation 2
    ]

    for (const scramble of scrambles) {
      const result = solveFirstLayer(scramble)
      verifyWhiteCorners(result.state)
    }
  })

  it('should solve corners with piece in U layer wrong position', () => {
    const result = solveFirstLayer(["U'", 'R', 'U'])

    verifyWhiteCorners(result.state)
  })

  it('should solve full scramble corners', () => {
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
    const result = solveFirstLayer(scramble)

    verifyWhiteCorners(result.state)
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
      const result = solveFirstLayer(scramble)
      verifyWhiteCorners(result.state)
    }
  })
})
