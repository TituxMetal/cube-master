import type { Solution } from '@packages/cube-engine'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { PhaseList } from '~/features/solver/components/PhaseList'

afterEach(() => {
  cleanup()
})

const makeSolution = (): Solution => ({
  phases: [
    { name: 'White Cross', groups: [{ moves: ['F', 'R', "U'"] }] },
    { name: 'White Corners', groups: [{ moves: ['D', "R'", 'D', 'R'] }] },
    { name: 'Second Layer', groups: [{ moves: ["D'", "R'", 'D', 'R', 'D', 'F', "D'", "F'"] }] },
    { name: 'Yellow Cross', groups: [{ moves: ["F'", "R'", "D'", 'R', 'D', 'F'] }] },
    { name: 'Yellow Layer', groups: [{ moves: ['R', 'D', "R'", 'D'] }] }
  ],
  totalMoves: 25
})

describe('PhaseList', () => {
  it('should render all 5 phase names', () => {
    render(
      <PhaseList
        solution={makeSolution()}
        currentPhaseIndex={0}
        currentStepInPhase={0}
        onJumpToPhase={() => {}}
      />
    )

    expect(screen.getByText('White Cross')).toBeDefined()
    expect(screen.getByText('White Corners')).toBeDefined()
    expect(screen.getByText('Second Layer')).toBeDefined()
    expect(screen.getByText('Yellow Cross')).toBeDefined()
    expect(screen.getByText('Yellow Layer')).toBeDefined()
  })

  it('should show checkmark for completed phases', () => {
    const { container } = render(
      <PhaseList
        solution={makeSolution()}
        currentPhaseIndex={2}
        currentStepInPhase={3}
        onJumpToPhase={() => {}}
      />
    )

    const items = container.querySelectorAll('li')
    expect(items[0].textContent).toContain('✓')
    expect(items[1].textContent).toContain('✓')
  })

  it('should show progress for current phase', () => {
    render(
      <PhaseList
        solution={makeSolution()}
        currentPhaseIndex={2}
        currentStepInPhase={3}
        onJumpToPhase={() => {}}
      />
    )

    expect(screen.getByText('3/8')).toBeDefined()
  })

  it('should mark current phase with aria-current', () => {
    render(
      <PhaseList
        solution={makeSolution()}
        currentPhaseIndex={1}
        currentStepInPhase={2}
        onJumpToPhase={() => {}}
      />
    )

    const current = screen.getByLabelText('Jump to White Corners')
    expect(current.getAttribute('aria-current')).toBe('step')

    const other = screen.getByLabelText('Jump to White Cross')
    expect(other.getAttribute('aria-current')).toBeNull()
  })

  it('should call onJumpToPhase when clicking a phase', async () => {
    const user = userEvent.setup()
    const onJump = mock(() => {})

    render(
      <PhaseList
        solution={makeSolution()}
        currentPhaseIndex={0}
        currentStepInPhase={0}
        onJumpToPhase={onJump}
      />
    )

    await user.click(screen.getByLabelText('Jump to Second Layer'))

    expect(onJump).toHaveBeenCalledTimes(1)
    expect(onJump).toHaveBeenCalledWith(2)
  })

  it('should show dash for phase with 0 moves', () => {
    const solution: Solution = {
      phases: [
        { name: 'White Cross', groups: [] },
        { name: 'White Corners', groups: [{ moves: ['D', 'R'] }] }
      ],
      totalMoves: 2
    }

    const { container } = render(
      <PhaseList
        solution={solution}
        currentPhaseIndex={0}
        currentStepInPhase={0}
        onJumpToPhase={() => {}}
      />
    )

    const items = container.querySelectorAll('li')
    expect(items[0].textContent).toContain('—')
  })
})
