import { useStore } from '@nanostores/react'
import type { ColorCode, FaceCode, ReconstructResult, StickersByFace } from '@packages/cube-engine'
import {
  applyMoves,
  createSolvedState,
  generateScramble,
  reconstructState,
  toStickers
} from '@packages/cube-engine'
import { atom, computed } from 'nanostores'

export type SolverView = 'input' | 'solution'

export const $inputStickers = atom<StickersByFace>(toStickers(createSolvedState()))
export const $selectedColor = atom<ColorCode>('Wt')
export const $solverView = atom<SolverView>('input')

export const $validationResult = computed($inputStickers, (stickers): ReconstructResult => {
  return reconstructState(stickers)
})

export const paintSticker = (face: FaceCode, index: number, color: ColorCode) => {
  if (index === 4) return

  const current = $inputStickers.get()
  const faceStickers = [...current[face]]
  faceStickers[index] = color
  $inputStickers.set({ ...current, [face]: faceStickers })
}

export const selectColor = (color: ColorCode) => {
  $selectedColor.set(color)
}

export const resetInput = () => {
  $inputStickers.set(toStickers(createSolvedState()))
}

export const scrambleInput = () => {
  const moves = generateScramble()
  const state = applyMoves(createSolvedState(), moves)
  $inputStickers.set(toStickers(state))
}

export const useInputStickers = (): StickersByFace => useStore($inputStickers)
export const useSelectedColor = (): ColorCode => useStore($selectedColor)
export const useValidationResult = (): ReconstructResult => useStore($validationResult)
export const useSolverView = (): SolverView => useStore($solverView)
