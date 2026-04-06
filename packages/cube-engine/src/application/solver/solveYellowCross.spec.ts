import { describe, expect, it } from 'bun:test'

import type { CubeState, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import { toStickers } from '~/infrastructure/render/toStickers'

import { applyMoves } from '../use-cases/applyMoves'
import { createSolvedState } from '../use-cases/createSolvedState'

import { solveSecondLayer } from './solveSecondLayer'
import { solveWhiteCorners } from './solveWhiteCorners'
import { solveWhiteCross } from './solveWhiteCross'
import { solveYellowCross } from './solveYellowCross'

const solveToYellowCross = (scramble: MoveToken[]) => {
  let state = applyMoves(createSolvedState(), scramble)
  state = solveWhiteCross(state).state
  state = solveWhiteCorners(state).state
  state = solveSecondLayer(state).state
  return solveYellowCross(state)
}

const verifyYellowCross = (state: CubeState) => {
  // All D-layer edges should have orientation 0 (yellow faces D)
  const dEdges = ['DF', 'DR', 'DB', 'DL'] as const
  for (const pos of dEdges) {
    expect(state.edges[pos].orientation).toBe(0)
  }

  // U face and middle layer should still be intact
  const stickers = toStickers(state)
  for (let i = 0; i < 9; i++) {
    expect(stickers.U[i]).toBe(Color.White)
  }
}

describe('solveYellowCross', () => {
  it('should return 0 moves for already solved yellow cross', () => {
    const state = createSolvedState()
    const result = solveYellowCross(state)

    expect(result.groups.flatMap(g => g.moves)).toHaveLength(0)
  })

  it('should solve yellow cross after F2L', () => {
    const result = solveToYellowCross(['D', 'R', "F'"])
    verifyYellowCross(result.state)
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
      const result = solveToYellowCross(scramble)
      verifyYellowCross(result.state)
    }
  })
})
