import { describe, expect, it } from 'bun:test'

import type { MoveToken } from '~/domain'

import { applyMoves } from './applyMoves'
import { createSolvedState } from './createSolvedState'
import { invertMove, invertMoves } from './invertMoves'

describe('Use Case - invertMove', () => {
  it('should invert quarter turns', () => {
    expect(invertMove('R')).toBe("R'")
    expect(invertMove("U'")).toBe('U')
    expect(invertMove('F')).toBe("F'")
    expect(invertMove("L'")).toBe('L')
  })

  it('should keep double turns unchanged', () => {
    expect(invertMove('F2')).toBe('F2')
    expect(invertMove('R2')).toBe('R2')
    expect(invertMove('U2')).toBe('U2')
  })
})

describe('Use Case - invertMoves', () => {
  it('should reverse and invert a sequence', () => {
    const moves: MoveToken[] = ['R', 'U', "F'"]
    expect(invertMoves(moves)).toEqual(['F', "U'", "R'"])
  })

  it('should return empty array for empty input', () => {
    expect(invertMoves([])).toEqual([])
  })

  it('should produce identity when applied after original moves', () => {
    const moves: MoveToken[] = ['R', "U'", 'F2', 'D', "L'", 'B']
    const solved = createSolvedState()
    const scrambled = applyMoves(solved, moves)
    const result = applyMoves(scrambled, invertMoves(moves))

    expect(result).toEqual(solved)
  })
})
