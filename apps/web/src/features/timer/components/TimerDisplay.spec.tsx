import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { TimerDisplay } from '~/features/timer/components'

afterEach(() => {
  cleanup()
})

describe('TimerDisplay', () => {
  it('should show 0:00.00 for 0ms', () => {
    render(<TimerDisplay elapsedMs={0} state='idle' />)

    expect(screen.getByText('0:00.00')).toBeDefined()
  })

  it('should show formatted time for given ms value', () => {
    render(<TimerDisplay elapsedMs={83450} state='stopped' />)

    expect(screen.getByText('1:23.45')).toBeDefined()
  })

  it('should have different styling when running', () => {
    render(<TimerDisplay elapsedMs={1000} state='running' />)

    const output = screen.getByLabelText('Timer')

    expect(output.className).toContain('text-cube-red-text')
  })

  it('should not have running styling when idle', () => {
    render(<TimerDisplay elapsedMs={0} state='idle' />)

    const output = screen.getByLabelText('Timer')

    expect(output.className).not.toContain('text-cube-red-text')
  })

  it('should have aria-label Timer', () => {
    render(<TimerDisplay elapsedMs={0} state='idle' />)

    expect(screen.getByLabelText('Timer')).toBeDefined()
  })
})
