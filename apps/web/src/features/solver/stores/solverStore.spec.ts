import { Color, createSolvedState, toStickers } from '@packages/cube-engine'
import { beforeEach, describe, expect, it } from 'bun:test'

import {
  $inputStickers,
  $selectedColor,
  $validationResult,
  paintSticker,
  resetInput,
  scrambleInput,
  selectColor
} from '~/features/solver/stores'

beforeEach(() => {
  resetInput()
  selectColor('Wt')
})

describe('solverStore', () => {
  it('should initialize stickers to solved state', () => {
    const expected = toStickers(createSolvedState())
    expect($inputStickers.get()).toEqual(expected)
  })

  it('should initialize selected color to white', () => {
    expect($selectedColor.get()).toBe('Wt')
  })

  it('should validate solved stickers as valid', () => {
    const result = $validationResult.get()
    expect(result.ok).toBe(true)
  })

  it('should paint a sticker at given face and index', () => {
    paintSticker('U', 0, Color.Red)
    expect($inputStickers.get()['U'][0]).toBe('Rd')
  })

  it('should not paint center stickers (index 4)', () => {
    const before = $inputStickers.get()['U'][4]
    paintSticker('U', 4, Color.Red)
    expect($inputStickers.get()['U'][4]).toBe(before)
  })

  it('should update selected color', () => {
    selectColor('Rd')
    expect($selectedColor.get()).toBe('Rd')
  })

  it('should reset stickers to solved state', () => {
    paintSticker('U', 0, Color.Red)
    resetInput()
    const expected = toStickers(createSolvedState())
    expect($inputStickers.get()).toEqual(expected)
  })

  it('should scramble input stickers', () => {
    scrambleInput()
    const solved = toStickers(createSolvedState())
    expect($inputStickers.get()).not.toEqual(solved)
  })

  it('should invalidate after painting wrong color count', () => {
    paintSticker('U', 0, Color.Red)
    const result = $validationResult.get()
    expect(result.ok).toBe(false)
  })

  it('should revalidate after scramble', () => {
    scrambleInput()
    const result = $validationResult.get()
    expect(result.ok).toBe(true)
  })
})
