import { describe, expect, it } from 'bun:test'

import type { MoveToken } from '~/domain'
import { toStickers } from '~/infrastructure/render/toStickers'

import { applyMoves } from './applyMoves'
import { createSolvedState } from './createSolvedState'
import { solveCube } from './solveCube'

const verifySolution = (scramble: MoveToken[]) => {
  const scrambled = applyMoves(createSolvedState(), scramble)
  const solution = solveCube(scrambled)

  // Apply all solution moves to the scrambled state
  const allMoves = solution.phases.flatMap(p => p.groups.flatMap(g => g.moves))
  const result = applyMoves(scrambled, allMoves)

  // Should match solved state
  const resultStickers = toStickers(result)
  const solvedStickers = toStickers(createSolvedState())

  for (const face of ['U', 'D', 'F', 'B', 'L', 'R'] as const) {
    for (let i = 0; i < 9; i++) {
      expect(resultStickers[face][i]).toBe(solvedStickers[face][i])
    }
  }

  return solution
}

describe('solveCube', () => {
  it('should return 0 total moves for solved state', () => {
    const solution = solveCube(createSolvedState())

    expect(solution.totalMoves).toBe(0)
    expect(solution.phases).toHaveLength(5)
    for (const phase of solution.phases) {
      expect(phase.groups.flatMap(g => g.moves)).toHaveLength(0)
    }
  })

  it('should solve a simple scramble', () => {
    const solution = verifySolution(['D', 'R', "F'"])

    expect(solution.totalMoves).toBeGreaterThan(0)
    expect(solution.totalMoves).toBeLessThan(300)
  })

  it('should solve a medium scramble', () => {
    const solution = verifySolution(['R', "U'", 'F2', 'D', "L'", 'B', 'R2', "U'", 'F', 'D'])

    expect(solution.totalMoves).toBeLessThan(300)
  })

  it('should solve a full scramble', () => {
    const solution = verifySolution([
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
    ])

    expect(solution.totalMoves).toBeLessThan(300)
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
      verifySolution(scramble)
    }
    // Five full BFS solves — raise the per-test timeout above Bun's 5s default
    // so slower hardware doesn't trip a non-deterministic timeout.
  }, 10_000)

  it('should have correctly labeled phases', () => {
    const solution = solveCube(applyMoves(createSolvedState(), ['R', 'U', "F'"]))

    expect(solution.phases[0].name).toBe('White Cross')
    expect(solution.phases[1].name).toBe('White Corners')
    expect(solution.phases[2].name).toBe('Second Layer')
    expect(solution.phases[3].name).toBe('Yellow Cross')
    expect(solution.phases[4].name).toBe('Yellow Layer')
  })
})
