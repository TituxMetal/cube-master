import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { StatsPanel } from '~/features/timer/components/StatsPanel'
import type { Solve } from '~/features/timer/stores/sessionStore'

afterEach(() => {
  cleanup()
})

const makeSolve = (time: number, dnf = false): Solve => ({
  id: crypto.randomUUID(),
  time,
  scramble: ['R', 'U'],
  timestamp: Date.now(),
  dnf
})

describe('StatsPanel', () => {
  it('should show dash for all stats when no solves', () => {
    render(<StatsPanel solves={[]} />)

    const dashes = screen.getAllByText('\u2014')

    expect(dashes).toHaveLength(4)
  })

  it('should show best time after solves', () => {
    const solves = [makeSolve(12340), makeSolve(8920)]

    render(<StatsPanel solves={solves} />)

    expect(screen.getByText('0:08.92')).toBeDefined()
  })

  it('should show Ao5 after 5 solves', () => {
    const solves = [
      makeSolve(10000),
      makeSolve(12000),
      makeSolve(8000),
      makeSolve(11000),
      makeSolve(15000)
    ]

    render(<StatsPanel solves={solves} />)

    expect(screen.getByText('0:11.00')).toBeDefined()
  })

  it('should show dash for Ao5 with insufficient solves', () => {
    const solves = [makeSolve(10000), makeSolve(12000)]

    render(<StatsPanel solves={solves} />)

    const section = screen.getByLabelText('Statistics')
    const dashes = section.querySelectorAll('.stat-value')

    // Best and Worst have values, Ao5 and Ao12 show dashes
    expect(dashes[2].textContent).toBe('\u2014')
    expect(dashes[3].textContent).toBe('\u2014')
  })
})
