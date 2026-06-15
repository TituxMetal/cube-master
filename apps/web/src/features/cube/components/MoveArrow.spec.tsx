import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { MoveArrow, moveFace } from '~/features/cube/components/MoveArrow'

afterEach(() => {
  cleanup()
})

describe('moveFace', () => {
  it('should read the base face off a move token', () => {
    expect(moveFace('R')).toBe('R')
    expect(moveFace("D'")).toBe('D')
    expect(moveFace('F2')).toBe('F')
  })
})

describe('MoveArrow', () => {
  it('should label a clockwise quarter turn', () => {
    render(<MoveArrow move='R' />)
    expect(screen.getByLabelText('turn R clockwise')).toBeDefined()
  })

  it('should label a counter-clockwise turn', () => {
    render(<MoveArrow move="D'" />)
    expect(screen.getByLabelText("turn D' counter-clockwise")).toBeDefined()
  })

  it('should label and badge a half turn', () => {
    render(<MoveArrow move='F2' />)
    expect(screen.getByLabelText('turn F2 half turn')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
  })
})
