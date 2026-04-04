import type { MoveToken } from '@packages/cube-engine'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { ScrambleDisplay } from '~/features/timer/components'

afterEach(() => {
  cleanup()
})

const testScramble: MoveToken[] = ['R', 'U', "F'", 'L2', 'B', "D'"]

describe('ScrambleDisplay', () => {
  it('should render all moves', () => {
    render(<ScrambleDisplay scramble={testScramble} />)

    for (const move of testScramble) {
      expect(screen.getByText(move)).toBeDefined()
    }
  })

  it('should have aria-label Scramble', () => {
    render(<ScrambleDisplay scramble={testScramble} />)

    expect(screen.getByLabelText('Scramble')).toBeDefined()
  })

  it('should use monospace font', () => {
    render(<ScrambleDisplay scramble={testScramble} />)

    const section = screen.getByLabelText('Scramble')

    expect(section.querySelector('.font-mono')).toBeDefined()
  })
})
