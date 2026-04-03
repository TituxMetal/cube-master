import type { ColorCode, CubeState, FaceCode, StickerIndex, StickerMapping } from '~/domain'
import { stickerMapping, faceIndexInId } from '~/domain/geometry'

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
        const colorIndex = faceIndexInId(stickerInfo.edgeId, stickerInfo.face)
        return piece.colors[colorIndex]
      }
      case 'corner': {
        const piece = state.corners[stickerInfo.cornerId]
        const colorIndex = faceIndexInId(stickerInfo.cornerId, stickerInfo.face)
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
