import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { newSolve } from '~/features/solver/stores'
import { Solver } from '~/pages/Solver'

beforeEach(() => {
  newSolve()
})

afterEach(() => {
  cleanup()
})

describe('Solver', () => {
  it('should render the title', () => {
    render(<Solver />)

    expect(screen.getByText('Solver')).toBeDefined()
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

  it('should show validation error after cycling sticker color', async () => {
    const user = userEvent.setup()
    render(<Solver />)

    const upFace = screen.getByLabelText('Up face')
    const buttons = upFace.querySelectorAll('button')
    await user.click(buttons[0])

    expect(screen.getByText(/Expected 9 white stickers/)).toBeDefined()
  })

  it('should show scramble notation after scramble', async () => {
    const user = userEvent.setup()
    render(<Solver />)

    await user.click(screen.getByText('Scramble'))

    expect(screen.getByLabelText('Scramble notation')).toBeDefined()
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

describe('Solver — solution view', () => {
  const setupSolutionView = async () => {
    const user = userEvent.setup()
    render(<Solver />)

    await user.click(screen.getByText('Scramble'))
    await user.click(screen.getByText('Solve'))

    return user
  }

  it('should switch to solution view after solving', async () => {
    await setupSolutionView()

    expect(screen.getByText('Step through the solution')).toBeDefined()
    expect(screen.getByLabelText('Solution phases')).toBeDefined()
    expect(screen.getByLabelText('Step controls')).toBeDefined()
  })

  it('should show all 5 phases in phase list', async () => {
    await setupSolutionView()

    expect(screen.getByText('White Cross')).toBeDefined()
    expect(screen.getByText('White Corners')).toBeDefined()
    expect(screen.getByText('Second Layer')).toBeDefined()
    expect(screen.getByText('Yellow Cross')).toBeDefined()
    expect(screen.getByText('Yellow Layer')).toBeDefined()
  })

  it('should show step controls with initial state', async () => {
    await setupSolutionView()

    expect(screen.getByText(/Step 0\//)).toBeDefined()
    expect((screen.getByLabelText('Previous step') as HTMLButtonElement).disabled).toBe(true)
  })

  it('should navigate steps with next and previous', async () => {
    const user = await setupSolutionView()

    await user.click(screen.getByLabelText('Next step'))
    expect(screen.getByText(/Step 1\//)).toBeDefined()

    await user.click(screen.getByLabelText('Previous step'))
    expect(screen.getByText(/Step 0\//)).toBeDefined()
  })

  it('should return to input view with New Solve', async () => {
    const user = await setupSolutionView()

    await user.click(screen.getByText('New Solve'))

    expect(screen.getByText('Click stickers to cycle colors, then solve')).toBeDefined()
    expect(screen.getByLabelText('Interactive cube state')).toBeDefined()
  })

  it('should display cube net in solution view', async () => {
    await setupSolutionView()

    expect(screen.getByLabelText('Interactive cube state')).toBeDefined()
  })
})
