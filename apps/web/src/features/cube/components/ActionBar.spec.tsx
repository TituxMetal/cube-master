import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { ActionBar } from '~/features/cube/components/ActionBar'

afterEach(() => {
  cleanup()
})

describe('ActionBar', () => {
  it('should render the Reset button', () => {
    render(<ActionBar moveCount={0} onReset={() => {}} />)

    expect(screen.getByRole('button', { name: 'Reset' })).toBeDefined()
  })

  it('should disable Reset when moveCount is 0', () => {
    render(<ActionBar moveCount={0} onReset={() => {}} />)

    expect(screen.getByRole('button', { name: 'Reset' }).hasAttribute('disabled')).toBe(true)
  })

  it('should enable Reset when moveCount is greater than 0', () => {
    render(<ActionBar moveCount={5} onReset={() => {}} />)

    expect(screen.getByRole('button', { name: 'Reset' }).hasAttribute('disabled')).toBe(false)
  })

  it('should hide move counter when moveCount is 0', () => {
    render(<ActionBar moveCount={0} onReset={() => {}} />)

    expect(screen.queryByText(/moves/)).toBeNull()
  })

  it('should show singular "move" for count of 1', () => {
    render(<ActionBar moveCount={1} onReset={() => {}} />)

    expect(screen.getByText('1 move')).toBeDefined()
  })

  it('should show plural "moves" for count greater than 1', () => {
    render(<ActionBar moveCount={7} onReset={() => {}} />)

    expect(screen.getByText('7 moves')).toBeDefined()
  })

  it('should hide Scramble button when onScramble is not provided', () => {
    render(<ActionBar moveCount={0} onReset={() => {}} />)

    expect(screen.queryByRole('button', { name: 'Scramble' })).toBeNull()
  })

  it('should show Scramble button when onScramble is provided', () => {
    render(<ActionBar moveCount={0} onReset={() => {}} onScramble={() => {}} />)

    expect(screen.getByRole('button', { name: 'Scramble' })).toBeDefined()
  })

  it('should call onReset when clicking Reset', async () => {
    const user = userEvent.setup()
    const onReset = mock(() => {})

    render(<ActionBar moveCount={3} onReset={onReset} />)

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should call onScramble when clicking Scramble', async () => {
    const user = userEvent.setup()
    const onScramble = mock(() => {})

    render(<ActionBar moveCount={0} onReset={() => {}} onScramble={onScramble} />)

    await user.click(screen.getByRole('button', { name: 'Scramble' }))

    expect(onScramble).toHaveBeenCalledTimes(1)
  })
})
