import { useStore } from '@nanostores/react'
import type { CubeState, MoveToken, StickersByFace } from '@packages/cube-engine'
import {
  applyMove,
  applyMoves,
  createSolvedState,
  generateScramble,
  toStickers
} from '@packages/cube-engine'
import { atom, computed } from 'nanostores'

export const $cubeState = atom<CubeState>(createSolvedState())
export const $moveHistory = atom<MoveToken[]>([])
export const $stickersByFace = computed($cubeState, toStickers)

export const applyMoveAction = (move: MoveToken) => {
  $cubeState.set(applyMove($cubeState.get(), move))
  $moveHistory.set([...$moveHistory.get(), move])
}

export const resetAction = () => {
  $cubeState.set(createSolvedState())
  $moveHistory.set([])
}

export const scrambleAction = () => {
  const moves = generateScramble()
  $cubeState.set(applyMoves(createSolvedState(), moves))
  $moveHistory.set(moves)
}

export const useStickersByFace = (): StickersByFace => useStore($stickersByFace)
export const useMoveHistory = (): MoveToken[] => useStore($moveHistory)
