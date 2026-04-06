import { describe, expect, it } from 'bun:test'

import type { CubeState, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import { applyMove } from '~/domain/moves/apply'
import { toStickers } from '~/infrastructure/render/toStickers'

import { applyMoves } from '../use-cases/applyMoves'
import { createSolvedState } from '../use-cases/createSolvedState'

import { solveWhiteCross } from './solveWhiteCross'

const verifyWhiteCross = (state: CubeState) => {
  const stickers = toStickers(state)

  // U face edge stickers (indices 1, 3, 5, 7) should be white
  expect(stickers.U[1]).toBe(Color.White) // UB edge on U
  expect(stickers.U[3]).toBe(Color.White) // UL edge on U
  expect(stickers.U[5]).toBe(Color.White) // UR edge on U
  expect(stickers.U[7]).toBe(Color.White) // UF edge on U

  // Side colors must match centers
  expect(stickers.F[1]).toBe(stickers.F[4]) // UF edge on F matches F center
  expect(stickers.R[1]).toBe(stickers.R[4]) // UR edge on R matches R center
  expect(stickers.B[1]).toBe(stickers.B[4]) // UB edge on B matches B center
  expect(stickers.L[1]).toBe(stickers.L[4]) // UL edge on L matches L center
}

describe('solveWhiteCross', () => {
  it('should return 0 moves for already solved cross', () => {
    const state = createSolvedState()
    const result = solveWhiteCross(state)

    expect(result.groups.flatMap(g => g.moves)).toHaveLength(0)
    verifyWhiteCross(result.state)
  })

  it('should solve a single edge in D layer (aligned, correct orientation)', () => {
    // F2 sends UF to DF with white on D
    const state = applyMove(createSolvedState(), 'F2')
    const result = solveWhiteCross(state)

    expect(result.groups.flatMap(g => g.moves).length).toBeGreaterThan(0)
    verifyWhiteCross(result.state)
  })

  it('should solve a single edge in D layer (flipped)', () => {
    // F D sends UF edge away with orientation change
    const state = applyMoves(createSolvedState(), ['F', 'D'] as MoveToken[])
    const result = solveWhiteCross(state)

    verifyWhiteCross(result.state)
  })

  it('should solve a single edge in middle layer', () => {
    // F sends UF to FR (middle layer)
    const state = applyMove(createSolvedState(), 'F')
    const result = solveWhiteCross(state)

    verifyWhiteCross(result.state)
  })

  it('should solve a single edge in U layer wrong position', () => {
    // U sends UF to UL, UR to UF, UB to UR, UL to UB
    const state = applyMove(createSolvedState(), 'U')
    const result = solveWhiteCross(state)

    verifyWhiteCross(result.state)
  })

  it('should solve a single edge in U layer flipped', () => {
    // F R' sends UF edge to UR with orientation change
    const state = applyMoves(createSolvedState(), ['F', "R'"] as MoveToken[])
    const result = solveWhiteCross(state)

    verifyWhiteCross(result.state)
  })

  it('should solve a fully scrambled cube white cross', () => {
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
    const state = applyMoves(createSolvedState(), scramble)
    const result = solveWhiteCross(state)

    verifyWhiteCross(result.state)
  })

  it('should solve white cross for multiple random scrambles', () => {
    const scrambles: MoveToken[][] = [
      ['R', "U'", 'F2', 'D', "L'"],
      ["B'", 'R2', 'U', 'F', "D'", 'L'],
      ['U2', "R'", 'F', 'D2', 'B', "L'", 'U', 'R'],
      ['F', 'R', 'U', "B'", "D'", 'L2', "F'", 'R', 'D'],
      ["U'", "F'", 'R2', "B'", 'D2', 'L', 'U', "R'", "F'", 'D']
    ]

    for (const scramble of scrambles) {
      const state = applyMoves(createSolvedState(), scramble)
      const result = solveWhiteCross(state)

      verifyWhiteCross(result.state)
    }
  })

  it('should produce a reasonable number of moves', () => {
    const scramble: MoveToken[] = ['R', 'U', "F'", 'D2', 'L', "B'", 'R2', 'U', 'D', "L'"]
    const state = applyMoves(createSolvedState(), scramble)
    const result = solveWhiteCross(state)

    // White cross should never need more than ~40 moves
    expect(result.groups.flatMap(g => g.moves).length).toBeLessThan(40)
    verifyWhiteCross(result.state)
  })
})
