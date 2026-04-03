import { describe, expect, it } from 'bun:test'

import { createSolvedState } from '~/application/use-cases/createSolvedState'

import { applyMove } from './apply'
import type { FaceMove } from './tokens'

describe('Cube Domain - applyMove', () => {
  const solved = createSolvedState()

  describe('purity', () => {
    it('should return a new object (not same reference)', () => {
      const result = applyMove(solved, 'U')

      expect(result).not.toBe(solved)
    })

    it('should not mutate the original state', () => {
      const snapshot = structuredClone(solved)

      applyMove(solved, 'U')

      expect(solved).toEqual(snapshot)
    })
  })

  describe('smoke tests', () => {
    it('should move U-layer corners after a U move', () => {
      const result = applyMove(solved, 'U')

      expect(result.corners.ULF.id).toBe('UFR')
      expect(result.corners.UBL.id).toBe('ULF')
      expect(result.corners.URB.id).toBe('UBL')
      expect(result.corners.UFR.id).toBe('URB')
    })

    it('should not affect D-layer corners after a U move', () => {
      const result = applyMove(solved, 'U')
      const dCorners = ['DFR', 'DRB', 'DBL', 'DLF'] as const

      dCorners.forEach(position => {
        expect(result.corners[position]).toEqual(solved.corners[position])
      })
    })

    it('should never modify centers for any face move', () => {
      const baseMoves: FaceMove[] = ['U', 'D', 'R', 'L', 'F', 'B']

      baseMoves.forEach(move => {
        const result = applyMove(solved, move)

        expect(result.centers).toEqual(solved.centers)
      })
    })
  })

  describe('identity — quarter turn × 4 = solved', () => {
    const baseMoves: FaceMove[] = ['U', 'D', 'R', 'L', 'F', 'B']

    baseMoves.forEach(move => {
      it(`${move} × 4 should return to solved state`, () => {
        let result = solved

        for (let i = 0; i < 4; i++) {
          result = applyMove(result, move)
        }

        expect(result).toEqual(solved)
      })
    })
  })

  describe('identity — move + inverse = solved', () => {
    const pairs: [FaceMove, FaceMove][] = [
      ['U', "U'"],
      ['D', "D'"],
      ['R', "R'"],
      ['L', "L'"],
      ['F', "F'"],
      ['B', "B'"]
    ]

    pairs.forEach(([move, inverse]) => {
      it(`${move} + ${inverse} should return to solved state`, () => {
        let result = applyMove(solved, move)

        result = applyMove(result, inverse)

        expect(result).toEqual(solved)
      })
    })
  })

  describe('identity — double × 2 = solved', () => {
    const doubles: FaceMove[] = ['U2', 'D2', 'R2', 'L2', 'F2', 'B2']

    doubles.forEach(move => {
      it(`${move} × 2 should return to solved state`, () => {
        let result = solved

        for (let i = 0; i < 2; i++) {
          result = applyMove(result, move)
        }

        expect(result).toEqual(solved)
      })
    })
  })
})
