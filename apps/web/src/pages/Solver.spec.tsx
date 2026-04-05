import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { resetInput } from '~/features/solver/stores'
import { Solver } from '~/pages/Solver'

beforeEach(() => {
  resetInput()
})

afterEach(() => {
  cleanup()
})

describe('Solver', () => {
  it('should render the title', () => {
    render(<Solver />)

    expect(screen.getByText('Solver')).toBeDefined()
  })

  it('should render the color palette', () => {
    render(<Solver />)

    expect(screen.getByLabelText('Color palette')).toBeDefined()
  })

  it('should render the interactive cube net', () => {
    render(<Solver />)

    expect(screen.getByLabelText('Interactive cube state')).toBeDefined()
  })

  it('should render action buttons', () => {
    render(<Solver />)

    expect(screen.getByText('Reset')).toBeDefined()
    expect(screen.getByText('Scramble')).toBeDefined()
    expect(screen.getByText('Solve')).toBeDefined()
  })

  it('should disable Solve button for solved state', () => {
    render(<Solver />)

    const solveBtn = screen.getByText('Solve')
    expect((solveBtn as HTMLButtonElement).disabled).toBe(true)
  })

  it('should show already solved message for initial state', () => {
    render(<Solver />)

    expect(screen.getByText('Cube is already solved')).toBeDefined()
  })

  it('should show validation error after painting invalid stickers', async () => {
    const user = userEvent.setup()
    render(<Solver />)

    await user.click(screen.getByLabelText('Select red'))

    const upFace = screen.getByLabelText('Up face')
    const buttons = upFace.querySelectorAll('button')
    await user.click(buttons[0])

    expect(screen.getByText(/Expected 9 white stickers/)).toBeDefined()
  })

  it('should enable Solve button after scramble', async () => {
    const user = userEvent.setup()
    render(<Solver />)

    await user.click(screen.getByText('Scramble'))

    const solveBtn = screen.getByText('Solve')
    expect((solveBtn as HTMLButtonElement).disabled).toBe(false)
  })

  it('should show valid state message after scramble', async () => {
    const user = userEvent.setup()
    render(<Solver />)

    await user.click(screen.getByText('Scramble'))

    expect(screen.getByText('Valid cube state')).toBeDefined()
  })

  it('should reset to solved state when clicking Reset', async () => {
    const user = userEvent.setup()
    render(<Solver />)

    await user.click(screen.getByText('Scramble'))
    await user.click(screen.getByText('Reset'))

    expect(screen.getByText('Cube is already solved')).toBeDefined()
  })
})
