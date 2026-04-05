import { describe, expect, it } from 'bun:test'

import type { ColorCode, FaceCode, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import type { StickersByFace } from '~/infrastructure/render/toStickers'
import { toStickers } from '~/infrastructure/render/toStickers'

import { applyMoves } from './applyMoves'
import { createSolvedState } from './createSolvedState'
import { reconstructState } from './reconstructState'

const solvedStickers = (): StickersByFace => toStickers(createSolvedState())

const setStickerAt = (
  stickers: StickersByFace,
  face: FaceCode,
  index: number,
  color: ColorCode
): StickersByFace => {
  const copy = { ...stickers }
  copy[face] = [...copy[face]]
  copy[face][index] = color
  return copy
}

describe('Use Case - reconstructState', () => {
  it('should reconstruct solved stickers to solved state', () => {
    const result = reconstructState(solvedStickers())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const solvedState = createSolvedState()
    expect(result.state).toEqual(solvedState)
  })

  it('should reconstruct a scrambled state correctly', () => {
    const moves: MoveToken[] = ['R', 'U', "F'", 'D2', 'L']
    const originalState = applyMoves(createSolvedState(), moves)
    const stickers = toStickers(originalState)

    const result = reconstructState(stickers)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state).toEqual(originalState)
  })

  it('should reconstruct after a long scramble', () => {
    const moves: MoveToken[] = [
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
    const originalState = applyMoves(createSolvedState(), moves)
    const stickers = toStickers(originalState)

    const result = reconstructState(stickers)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state).toEqual(originalState)
  })

  it('should return error for wrong color count', () => {
    const stickers = setStickerAt(solvedStickers(), 'U', 0, Color.Red)

    const result = reconstructState(stickers)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some(e => e.includes('white'))).toBe(true)
    expect(result.errors.some(e => e.includes('red'))).toBe(true)
  })

  it('should return error for invalid corner color combination', () => {
    // Swap U:8 (UFR on U=Wt) with F:2 (UFR on F=Gn) to create a flipped corner
    // that violates orientation sum
    const fresh = solvedStickers()
    const ufrOnU = fresh['U'][8]
    const ufrOnF = fresh['F'][2]
    const swapped = setStickerAt(setStickerAt(fresh, 'U', 8, ufrOnF), 'F', 2, ufrOnU)

    const result = reconstructState(swapped)

    expect(result.ok).toBe(false)
  })

  it('should return error for duplicate piece', () => {
    // Make UB edge look like UF edge (Wt-Gn duplicate), compensate counts elsewhere
    let stickers = solvedStickers()
    stickers = setStickerAt(stickers, 'B', 1, Color.Green)
    stickers = setStickerAt(stickers, 'F', 3, Color.Blue)

    const result = reconstructState(stickers)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some(e => e.includes('Duplicate'))).toBe(true)
  })

  it('should return error for impossible corner orientation sum', () => {
    const state = createSolvedState()
    const twistedState = {
      ...state,
      corners: {
        ...state.corners,
        UFR: { ...state.corners.UFR, orientation: 1 as const }
      }
    }
    const stickers = toStickers(twistedState)
    const result = reconstructState(stickers)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some(e => e.includes('corner orientations'))).toBe(true)
  })

  it('should return error for impossible edge orientation sum', () => {
    const state = createSolvedState()
    const flippedState = {
      ...state,
      edges: {
        ...state.edges,
        UF: { ...state.edges.UF, orientation: 1 as const }
      }
    }
    const stickers = toStickers(flippedState)
    const result = reconstructState(stickers)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some(e => e.includes('edge orientations'))).toBe(true)
  })

  it('should return error for parity mismatch', () => {
    const state = createSolvedState()
    const ufPiece = state.edges.UF
    const urPiece = state.edges.UR
    const swappedState = {
      ...state,
      edges: {
        ...state.edges,
        UF: { ...urPiece, position: 'UF' as const },
        UR: { ...ufPiece, position: 'UR' as const }
      }
    }
    const stickers = toStickers(swappedState)
    const result = reconstructState(stickers)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.some(e => e.includes('parity mismatch'))).toBe(true)
  })

  it('should return multiple errors at once', () => {
    const state = createSolvedState()
    const brokenState = {
      ...state,
      corners: {
        ...state.corners,
        UFR: { ...state.corners.UFR, orientation: 1 as const }
      },
      edges: {
        ...state.edges,
        UF: { ...state.edges.UF, orientation: 1 as const }
      }
    }
    const stickers = toStickers(brokenState)
    const result = reconstructState(stickers)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })

  it('should be the inverse of toStickers for valid states', () => {
    const scrambles: MoveToken[][] = [
      ['R', 'U'],
      ["R'", 'U2', 'F'],
      ['R', 'U', "F'", 'D', 'L', 'B'],
      ['R2', "U'", 'F2', "D'", 'L2', "B'", 'R', 'U', 'F', 'D']
    ]

    for (const moves of scrambles) {
      const state = applyMoves(createSolvedState(), moves)
      const stickers = toStickers(state)
      const result = reconstructState(stickers)

      expect(result.ok).toBe(true)
      if (!result.ok) continue
      expect(result.state).toEqual(state)
    }
  })
})
