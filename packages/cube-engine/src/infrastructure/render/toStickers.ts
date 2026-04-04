import type {
  ColorCode,
  CornerPositionId,
  CubeState,
  FaceCode,
  StickerIndex,
  StickerMapping
} from '~/domain'
import { stickerMapping, faceIndexInId } from '~/domain/geometry'

/**
 * Compute the color index for a corner sticker, accounting for the chirality
 * difference between U-layer and D-layer corner naming conventions.
 *
 * U-layer names (UFR, ULF, URB, UBL) and D-layer names (DFR, DLF, DRB, DBL)
 * list faces in opposite cyclic orders. Same-layer moves produce cyclic
 * sticker permutations, but cross-layer moves produce transpositions that
 * require separate handling.
 */
const cornerColorIndex = (
  pieceId: CornerPositionId,
  positionId: CornerPositionId,
  baseIndex: number,
  orientation: number
): number => {
  const sameLayer = pieceId[0] === positionId[0]

  if (sameLayer) {
    return positionId[0] === 'U' ? (baseIndex + orientation) % 3 : (baseIndex - orientation + 3) % 3
  }

  const fixed = pieceId[0] === 'U' ? (3 - orientation) % 3 : orientation

  return baseIndex === fixed ? baseIndex : 3 - baseIndex - fixed
}

export type StickersByFace = Record<FaceCode, ColorCode[]>

type StickerInfo = StickerMapping[FaceCode][StickerIndex]

const stickerIndices: readonly StickerIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export const toStickers = (state: CubeState): StickersByFace => {
  const faces = ['U', 'D', 'F', 'B', 'L', 'R'] as const
  const result = {} as StickersByFace

  const getStickerColor = (stickerInfo: StickerInfo): ColorCode => {
    switch (stickerInfo.type) {
      case 'center':
        return state.centers[stickerInfo.face]
      case 'edge': {
        const piece = state.edges[stickerInfo.edgeId]
        const baseIndex = faceIndexInId(stickerInfo.edgeId, stickerInfo.face)
        const colorIndex = (baseIndex + piece.orientation) % 2
        return piece.colors[colorIndex]
      }
      case 'corner': {
        const piece = state.corners[stickerInfo.cornerId]
        const baseIndex = faceIndexInId(stickerInfo.cornerId, stickerInfo.face)
        const colorIndex = cornerColorIndex(
          piece.id,
          stickerInfo.cornerId,
          baseIndex,
          piece.orientation
        )
        return piece.colors[colorIndex]
      }
    }
  }

  faces.forEach(faceCode => {
    const faceMapping = stickerMapping[faceCode]

    const faceStickers = stickerIndices.map(index => getStickerColor(faceMapping[index]))

    result[faceCode] = faceStickers
  })

  return result
}
