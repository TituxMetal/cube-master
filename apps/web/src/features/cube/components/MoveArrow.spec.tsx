import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { MoveBadge, cellArrowAngle, moveFace, moveTurn } from '~/features/cube/components/MoveArrow'

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

describe('cellArrowAngle', () => {
  it('should give no arrow for the centre or a half turn', () => {
    expect(cellArrowAngle(4, 'cw')).toBeNull()
    expect(cellArrowAngle(0, 'half')).toBeNull()
  })

  it('should mirror clockwise and counter-clockwise by 180°', () => {
    const cw = cellArrowAngle(0, 'cw')!
    const ccw = cellArrowAngle(0, 'ccw')!
    expect((cw + 180) % 360).toBe(ccw)
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
