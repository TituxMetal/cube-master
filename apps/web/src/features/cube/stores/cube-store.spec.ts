import { createSolvedState } from '@packages/cube-engine'
import { beforeEach, describe, expect, it } from 'bun:test'

import {
  $cubeState,
  $moveHistory,
  $stickersByFace,
  applyMoveAction,
  resetAction
} from '~/features/cube/stores/cube-store'

beforeEach(() => {
  resetAction()
})

describe('cube-store', () => {
  it('should have initial state as solved', () => {
    expect($cubeState.get()).toEqual(createSolvedState())
  })

  it('should have initial move history as empty', () => {
    expect($moveHistory.get()).toEqual([])
  })

  it('should have initial stickers matching solved state', () => {
    const stickers = $stickersByFace.get()

    for (const face of ['U', 'D', 'F', 'B', 'L', 'R'] as const) {
      const faceStickers = stickers[face]
      const center = faceStickers[4]

      faceStickers.forEach(sticker => {
        expect(sticker).toBe(center)
      })
    }
  })

  it('should update state when applying a move', () => {
    applyMoveAction('R')

    expect($cubeState.get()).not.toEqual(createSolvedState())
  })

  it('should append to history when applying moves', () => {
    applyMoveAction('R')
    applyMoveAction('U')

    expect($moveHistory.get()).toEqual(['R', 'U'])
  })

  it('should update stickers when applying a move', () => {
    const solvedStickers = $stickersByFace.get()

    applyMoveAction('R')

    expect($stickersByFace.get()).not.toEqual(solvedStickers)
  })

  it('should restore solved state on reset', () => {
    applyMoveAction('R')
    resetAction()

    expect($cubeState.get()).toEqual(createSolvedState())
  })

  it('should clear history on reset', () => {
    applyMoveAction('R')
    resetAction()

    expect($moveHistory.get()).toEqual([])
  })
})
