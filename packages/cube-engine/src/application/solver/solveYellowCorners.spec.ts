import { describe, expect, it } from 'bun:test'

import type { CubeState, MoveToken } from '~/domain'
import { toStickers } from '~/infrastructure/render/toStickers'

import { applyMoves } from '../use-cases/applyMoves'
import { createSolvedState } from '../use-cases/createSolvedState'

import { solveSecondLayer } from './solveSecondLayer'
import { solveWhiteCorners } from './solveWhiteCorners'
import { solveWhiteCross } from './solveWhiteCross'
import { solveYellowCorners } from './solveYellowCorners'
import { solveYellowCross } from './solveYellowCross'

const solveFull = (scramble: MoveToken[]) => {
  let state = applyMoves(createSolvedState(), scramble)
  state = solveWhiteCross(state).state
  state = solveWhiteCorners(state).state
  state = solveSecondLayer(state).state
  state = solveYellowCross(state).state
  return solveYellowCorners(state)
}

const verifySolved = (state: CubeState) => {
  const stickers = toStickers(state)
  const solvedStickers = toStickers(createSolvedState())

  for (const face of ['U', 'D', 'F', 'B', 'L', 'R'] as const) {
    for (let i = 0; i < 9; i++) {
      expect(stickers[face][i]).toBe(solvedStickers[face][i])
    }
  }
}

describe('solveYellowCorners', () => {
  it('should return 0 moves for already solved cube', () => {
    const state = createSolvedState()
    const result = solveYellowCorners(state)

    expect(result.moves).toHaveLength(0)
  })

  it('should solve a simple scramble fully', () => {
    const result = solveFull(['D', 'R', "F'"])
    verifySolved(result.state)
  })

  it('should solve a full scramble', () => {
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
    const result = solveFull(scramble)
    verifySolved(result.state)
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
      const result = solveFull(scramble)
      verifySolved(result.state)
    }
  })
})
