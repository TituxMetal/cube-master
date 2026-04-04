import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { SolveHistory } from '~/features/timer/components'
import type { Solve } from '~/features/timer/stores'

afterEach(() => {
  cleanup()
})

const makeSolve = (overrides: Partial<Solve> = {}): Solve => ({
  id: crypto.randomUUID(),
  time: 12345,
  scramble: ['R', 'U', "F'"],
  timestamp: Date.now(),
  dnf: false,
  ...overrides
})

describe('SolveHistory', () => {
  it('should show empty state message when no solves', () => {
    render(<SolveHistory solves={[]} onToggleDnf={() => {}} onDelete={() => {}} />)

    expect(screen.getByText(/No solves yet/)).toBeDefined()
  })

  it('should render solve times in order', () => {
    const solves = [makeSolve({ time: 23450 }), makeSolve({ time: 12340 })]

    render(<SolveHistory solves={solves} onToggleDnf={() => {}} onDelete={() => {}} />)

    expect(screen.getByText('0:23.45')).toBeDefined()
    expect(screen.getByText('0:12.34')).toBeDefined()
  })

  it('should show DNF for DNF solves', () => {
    const solves = [makeSolve({ dnf: true })]

    render(<SolveHistory solves={solves} onToggleDnf={() => {}} onDelete={() => {}} />)

    expect(screen.getByText('DNF')).toBeDefined()
  })

  it('should call onToggleDnf when clicking DNF button', async () => {
    const user = userEvent.setup()
    const onToggleDnf = mock(() => {})
    const solves = [makeSolve()]

    render(<SolveHistory solves={solves} onToggleDnf={onToggleDnf} onDelete={() => {}} />)

    await user.click(screen.getByLabelText('Mark as DNF'))

    expect(onToggleDnf).toHaveBeenCalledWith(solves[0].id)
  })

  it('should call onDelete when clicking delete button', async () => {
    const user = userEvent.setup()
    const onDelete = mock(() => {})
    const solves = [makeSolve()]

    render(<SolveHistory solves={solves} onToggleDnf={() => {}} onDelete={onDelete} />)

    await user.click(screen.getByLabelText('Delete solve'))

    expect(onDelete).toHaveBeenCalledWith(solves[0].id)
  })
})
