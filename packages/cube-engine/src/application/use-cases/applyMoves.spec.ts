import { describe, expect, it } from 'bun:test'

import { applyMove } from '~/domain'
import type { MoveToken } from '~/domain'

import { applyMoves } from './applyMoves'
import { createSolvedState } from './createSolvedState'

describe('Use Case - applyMoves', () => {
  const solved = createSolvedState()

  it('should return identical state for empty move array', () => {
    const result = applyMoves(solved, [])

    expect(result).toEqual(solved)
  })

  it('should produce same result as single applyMove', () => {
    const result = applyMoves(solved, ['R'])
    const expected = applyMove(solved, 'R')

    expect(result).toEqual(expected)
  })

  it('should prove move order matters (R,U !== U,R)', () => {
    const result1 = applyMoves(solved, ['R', 'U'])
    const result2 = applyMoves(solved, ['U', 'R'])

    expect(result1).not.toEqual(result2)
  })

  it("should return to solved after sexy move x 6: (R U R' U') x 6", () => {
    const sexyMoves: MoveToken[] = ['R', 'U', "R'", "U'"]
    const moves = Array(6).fill(sexyMoves).flat()
    const result = applyMoves(solved, moves)

    expect(result).toEqual(solved)
  })

  it('should return to solved after T-perm x 2', () => {
    const tPermMoves: MoveToken[] = [
      'R',
      'U',
      "R'",
      "U'",
      "R'",
      'F',
      'R2',
      "U'",
      "R'",
      "U'",
      'R',
      'U',
      "R'",
      "F'"
    ]
    const moves = [...tPermMoves, ...tPermMoves]
    const result = applyMoves(solved, moves)

    expect(result).toEqual(solved)
  })
})
