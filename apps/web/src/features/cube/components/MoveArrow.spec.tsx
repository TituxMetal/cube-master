import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { MoveBadge, faceArrows, moveFace, moveTurn } from '~/features/cube/components/MoveArrow'

afterEach(() => {
  cleanup()
})

describe('move-token helpers', () => {
  it('should read the base face off a move token', () => {
    expect(moveFace('R')).toBe('R')
    expect(moveFace("D'")).toBe('D')
    expect(moveFace('F2')).toBe('F')
  })

  it('should read the turn direction off a move token', () => {
    expect(moveTurn('R')).toBe('cw')
    expect(moveTurn("R'")).toBe('ccw')
    expect(moveTurn('R2')).toBe('half')
  })
})

describe('faceArrows', () => {
  it('should mark the turning face with a rotation arrow and no per-sticker arrows', () => {
    const arrows = faceArrows('F', 'F')
    expect(arrows.rotation).toBe('cw')
    expect(Object.keys(arrows.cells)).toHaveLength(0)
  })

  it('should carry the band across the four neighbouring faces (ruwix F)', () => {
    // F turn: U bottom row → right, R left col → down, D top row → left, L right col → up.
    expect(faceArrows('F', 'U').cells).toEqual({ 6: 90, 7: 90, 8: 90 })
    expect(faceArrows('F', 'R').cells).toEqual({ 0: 180, 3: 180, 6: 180 })
    expect(faceArrows('F', 'D').cells).toEqual({ 0: 270, 1: 270, 2: 270 })
    expect(faceArrows('F', 'L').cells).toEqual({ 2: 0, 5: 0, 8: 0 })
  })

  it('should reverse the band direction for a prime move', () => {
    expect(faceArrows("F'", 'U').cells[7]).toBe(270)
  })

  it('should keep the band on a half turn so doubles are not arrow-less', () => {
    expect(faceArrows('R2', 'U').cells[5]).toBe(0)
    expect(faceArrows('R2', 'R').rotation).toBe('half')
  })

  it('should leave a face the move never touches blank', () => {
    expect(faceArrows('F', 'B').cells).toEqual({})
    expect(faceArrows('F', 'B').rotation).toBeNull()
  })
})

describe('MoveBadge', () => {
  it('should label the move and its direction', () => {
    render(<MoveBadge move="D'" />)
    const badge = screen.getByLabelText("coup D', sens anti-horaire")
    expect(badge.textContent).toBe("D'")
  })

  it('should describe a half turn', () => {
    render(<MoveBadge move='F2' />)
    expect(screen.getByLabelText('coup F2, demi-tour')).toBeDefined()
  })
})
