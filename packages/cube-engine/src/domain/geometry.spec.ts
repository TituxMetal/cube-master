import { describe, expect, it } from 'bun:test'

import { stickerMapping, faceIndexInId } from './geometry'
import type { CornerPositionId, EdgePositionId, FaceCode } from './pieces'

describe('Cube Domain - stickerMapping', () => {
  const faces = ['U', 'D', 'F', 'B', 'L', 'R'] as const

  it('should have correct edges on back face (viewed from behind)', () => {
    const layoutB = stickerMapping.B
    const rAdjacentEdge = layoutB[3]
    const lAdjacentEdge = layoutB[5]

    expect(rAdjacentEdge).toEqual({ type: 'edge', edgeId: 'BR', face: 'B' })
    expect(lAdjacentEdge).toEqual({ type: 'edge', edgeId: 'BL', face: 'B' })
  })

  it('should have 4 corners, 4 edges and 1 center on each face', () => {
    faces.forEach(faceCode => {
      const stickers = Object.values(stickerMapping[faceCode])

      let cornerCount = 0
      let edgeCount = 0
      let centerCount = 0

      stickers.forEach(sticker => {
        if (sticker.type === 'corner') {
          expect(sticker.cornerId).toContain(faceCode)
          cornerCount++
        }
        if (sticker.type === 'edge') {
          expect(sticker.edgeId).toContain(faceCode)
          edgeCount++
        }
        if (sticker.type === 'center') {
          expect(sticker.face).toBe(faceCode)
          centerCount++
        }
      })

      expect(cornerCount).toBe(4)
      expect(edgeCount).toBe(4)
      expect(centerCount).toBe(1)
    })
  })

  it('should have correct center sticker mapping on each face', () => {
    const faces = ['U', 'D', 'F', 'B', 'L', 'R'] as const

    faces.forEach(faceCode => {
      const faceMapping = stickerMapping[faceCode]
      const centerSticker = faceMapping[4]

      expect(centerSticker).toEqual({ type: 'center', face: faceCode })
    })
  })
})

describe('Cube Domain - faceIndexInId', () => {
  it('should map face codes to correct indices in piece color arrays', () => {
    const testCases: Array<{
      id: CornerPositionId | EdgePositionId
      face: FaceCode
      expectedIndex: number
    }> = [
      { id: 'UFR', face: 'U', expectedIndex: 0 },
      { id: 'UFR', face: 'F', expectedIndex: 1 },
      { id: 'UFR', face: 'R', expectedIndex: 2 },
      { id: 'DBL', face: 'D', expectedIndex: 0 },
      { id: 'DBL', face: 'B', expectedIndex: 1 },
      { id: 'DBL', face: 'L', expectedIndex: 2 },
      { id: 'UF', face: 'U', expectedIndex: 0 },
      { id: 'UF', face: 'F', expectedIndex: 1 },
      { id: 'BR', face: 'B', expectedIndex: 0 },
      { id: 'BR', face: 'R', expectedIndex: 1 }
    ]

    testCases.forEach(({ id, face, expectedIndex }) => {
      expect(faceIndexInId(id, face)).toBe(expectedIndex)
    })
  })
})
