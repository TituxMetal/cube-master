import { describe, it, expect } from 'bun:test'

import { Color } from './constants'
import {
  makeCornerPiece,
  makeEdgePiece,
  makeSolvedCornerPiece,
  makeSolvedEdgePiece
} from './pieces'

describe('Cube Domain - Pieces', () => {
  describe('makeCornerPiece', () => {
    it('should create a corner piece with correct properties', () => {
      const piece = makeCornerPiece('UFR', 'DLF', [Color.White, Color.Green, Color.Red], 2)

      expect(piece).toEqual({
        id: 'UFR',
        position: 'DLF',
        orientation: 2,
        colors: [Color.White, Color.Green, Color.Red]
      })
    })

    it('should create a corner piece with default orientation', () => {
      const piece = makeCornerPiece('UFR', 'UFR', [Color.White, Color.Green, Color.Red])

      expect(piece.orientation).toBe(0)
    })
  })

  describe('makeSolvedCornerPiece', () => {
    it('should force position to match id and orientation to 0', () => {
      const piece = makeSolvedCornerPiece('UFR', [Color.White, Color.Green, Color.Red])

      expect(piece.position).toBe('UFR')
      expect(piece.orientation).toBe(0)
      expect(piece.id).toBe('UFR')
      expect(piece.colors).toEqual([Color.White, Color.Green, Color.Red])
    })
  })

  describe('makeEdgePiece', () => {
    it('should create an edge piece with correct properties', () => {
      const piece = makeEdgePiece('UR', 'UL', [Color.White, Color.Red], 1)

      expect(piece).toEqual({
        id: 'UR',
        position: 'UL',
        orientation: 1,
        colors: [Color.White, Color.Red]
      })
    })

    it('should create an edge piece with default orientation', () => {
      const piece = makeEdgePiece('UR', 'UR', [Color.White, Color.Red])

      expect(piece.orientation).toBe(0)
      expect(piece.colors).toEqual([Color.White, Color.Red])
    })
  })

  describe('makeSolvedEdgePiece', () => {
    it('should force position to match id and orientation to 0', () => {
      const piece = makeSolvedEdgePiece('UR', [Color.White, Color.Red])

      expect(piece.position).toBe('UR')
      expect(piece.orientation).toBe(0)
      expect(piece.id).toBe('UR')
      expect(piece.colors).toEqual([Color.White, Color.Red])
    })
  })
})
