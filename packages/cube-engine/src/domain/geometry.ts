import type { CornerPositionId, EdgePositionId, FaceCode } from './pieces'

export type StickerIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type StickerMapping = {
  [face in FaceCode]: {
    [stickerIndex in StickerIndex]:
      | { type: 'center'; face: FaceCode }
      | { type: 'edge'; edgeId: EdgePositionId; face: FaceCode }
      | { type: 'corner'; cornerId: CornerPositionId; face: FaceCode }
  }
}

/**
 * Mapping of stickers on each face to their corresponding pieces and types.
 * For each face (U, D, F, B, L, R), it defines the type of each sticker
 * (corner, edge, or center) along with the associated piece ID and face.
 */
export const stickerMapping: StickerMapping = {
  U: {
    0: { type: 'corner', cornerId: 'UBL', face: 'U' },
    1: { type: 'edge', edgeId: 'UB', face: 'U' },
    2: { type: 'corner', cornerId: 'URB', face: 'U' },
    3: { type: 'edge', edgeId: 'UL', face: 'U' },
    4: { type: 'center', face: 'U' },
    5: { type: 'edge', edgeId: 'UR', face: 'U' },
    6: { type: 'corner', cornerId: 'ULF', face: 'U' },
    7: { type: 'edge', edgeId: 'UF', face: 'U' },
    8: { type: 'corner', cornerId: 'UFR', face: 'U' }
  },
  D: {
    0: { type: 'corner', cornerId: 'DBL', face: 'D' },
    1: { type: 'edge', edgeId: 'DB', face: 'D' },
    2: { type: 'corner', cornerId: 'DRB', face: 'D' },
    3: { type: 'edge', edgeId: 'DL', face: 'D' },
    4: { type: 'center', face: 'D' },
    5: { type: 'edge', edgeId: 'DR', face: 'D' },
    6: { type: 'corner', cornerId: 'DLF', face: 'D' },
    7: { type: 'edge', edgeId: 'DF', face: 'D' },
    8: { type: 'corner', cornerId: 'DFR', face: 'D' }
  },
  F: {
    0: { type: 'corner', cornerId: 'ULF', face: 'F' },
    1: { type: 'edge', edgeId: 'UF', face: 'F' },
    2: { type: 'corner', cornerId: 'UFR', face: 'F' },
    3: { type: 'edge', edgeId: 'FL', face: 'F' },
    4: { type: 'center', face: 'F' },
    5: { type: 'edge', edgeId: 'FR', face: 'F' },
    6: { type: 'corner', cornerId: 'DLF', face: 'F' },
    7: { type: 'edge', edgeId: 'DF', face: 'F' },
    8: { type: 'corner', cornerId: 'DFR', face: 'F' }
  },
  R: {
    0: { type: 'corner', cornerId: 'UFR', face: 'R' },
    1: { type: 'edge', edgeId: 'UR', face: 'R' },
    2: { type: 'corner', cornerId: 'URB', face: 'R' },
    3: { type: 'edge', edgeId: 'FR', face: 'R' },
    4: { type: 'center', face: 'R' },
    5: { type: 'edge', edgeId: 'BR', face: 'R' },
    6: { type: 'corner', cornerId: 'DFR', face: 'R' },
    7: { type: 'edge', edgeId: 'DR', face: 'R' },
    8: { type: 'corner', cornerId: 'DRB', face: 'R' }
  },
  L: {
    0: { type: 'corner', cornerId: 'UBL', face: 'L' },
    1: { type: 'edge', edgeId: 'UL', face: 'L' },
    2: { type: 'corner', cornerId: 'ULF', face: 'L' },
    3: { type: 'edge', edgeId: 'BL', face: 'L' },
    4: { type: 'center', face: 'L' },
    5: { type: 'edge', edgeId: 'FL', face: 'L' },
    6: { type: 'corner', cornerId: 'DBL', face: 'L' },
    7: { type: 'edge', edgeId: 'DL', face: 'L' },
    8: { type: 'corner', cornerId: 'DLF', face: 'L' }
  },
  B: {
    0: { type: 'corner', cornerId: 'URB', face: 'B' },
    1: { type: 'edge', edgeId: 'UB', face: 'B' },
    2: { type: 'corner', cornerId: 'UBL', face: 'B' },
    3: { type: 'edge', edgeId: 'BL', face: 'B' },
    4: { type: 'center', face: 'B' },
    5: { type: 'edge', edgeId: 'BR', face: 'B' },
    6: { type: 'corner', cornerId: 'DRB', face: 'B' },
    7: { type: 'edge', edgeId: 'DB', face: 'B' },
    8: { type: 'corner', cornerId: 'DBL', face: 'B' }
  }
}

/**
 * Given a piece ID and a face, return the index of that face in the piece ID.
 * For example, for corner piece "UFR" and face "F", it returns 1.
 *
 * @param id - The ID of the piece (e.g., "UFR" for a corner piece).
 * @param face - The face code to find within the piece ID (e.g., "F").
 * @returns The index of the face in the piece ID.
 * @throws Error if the face is not found in the piece ID.
 */
export const faceIndexInId = (id: CornerPositionId | EdgePositionId, face: FaceCode) => {
  const index = String(id).indexOf(face)

  if (index === -1) {
    throw new Error(`Invalid id ${id} for face ${face}`)
  }

  return index
}
