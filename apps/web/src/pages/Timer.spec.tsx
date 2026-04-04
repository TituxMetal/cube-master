import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import {
  $currentScramble,
  $solves,
  $timerState,
  clearSession,
  resetTimer
} from '~/features/timer/stores'
import { Timer } from '~/pages/Timer'

beforeEach(() => {
  resetTimer()
  clearSession()
})

afterEach(() => {
  cleanup()
})

describe('Timer', () => {
  it('should render scramble notation', () => {
    render(<Timer />)

    expect(screen.getByLabelText('Scramble')).toBeDefined()
  })

  it('should render timer display', () => {
    render(<Timer />)

    expect(screen.getByLabelText('Timer')).toBeDefined()
  })

  it('should show 0:00.00 initially', () => {
    render(<Timer />)

    expect(screen.getByText('0:00.00')).toBeDefined()
  })

  it('should start the timer on spacebar press', async () => {
    const user = userEvent.setup()
    render(<Timer />)

    await user.keyboard(' ')

    expect($timerState.get()).toBe('running')
  })

  it('should stop the timer on second spacebar press', async () => {
    const user = userEvent.setup()
    render(<Timer />)

    await user.keyboard(' ')
    await user.keyboard(' ')

    expect($timerState.get()).toBe('idle')
  })

  it('should generate a new scramble after stopping', async () => {
    const user = userEvent.setup()
    render(<Timer />)

    const firstScramble = $currentScramble.get()

    await user.keyboard(' ')
    await user.keyboard(' ')

    expect($currentScramble.get()).not.toEqual(firstScramble)
  })

  it('should start the timer when clicking the timer zone', async () => {
    const user = userEvent.setup()
    render(<Timer />)

    await user.click(screen.getByLabelText('Toggle timer'))

    expect($timerState.get()).toBe('running')
  })

  it('should record a solve in history after stopping', async () => {
    const user = userEvent.setup()
    render(<Timer />)

    await user.keyboard(' ')
    await user.keyboard(' ')

    expect($solves.get()).toHaveLength(1)
  })

  it('should toggle DNF on a solve from history', async () => {
    const user = userEvent.setup()
    render(<Timer />)

    await user.keyboard(' ')
    await user.keyboard(' ')

    await user.click(screen.getByLabelText('Mark as DNF'))

    expect($solves.get()[0].dnf).toBe(true)
  })

  it('should delete a solve from history', async () => {
    const user = userEvent.setup()
    render(<Timer />)

    await user.keyboard(' ')
    await user.keyboard(' ')

    await user.click(screen.getByLabelText('Delete solve'))

    expect($solves.get()).toHaveLength(0)
  })
})
