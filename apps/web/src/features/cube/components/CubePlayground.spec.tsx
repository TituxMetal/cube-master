import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { CubePlayground } from '~/features/cube/components/CubePlayground'
import { resetAction } from '~/features/cube/stores/cube-store'

beforeEach(() => {
  resetAction()
})

afterEach(() => {
  cleanup()
})

describe('CubePlayground', () => {
  it('should render the cube net', () => {
    render(<CubePlayground />)

    expect(screen.getByLabelText('Cube state')).toBeDefined()
  })

  it('should render move controls', () => {
    render(<CubePlayground />)

    expect(screen.getByLabelText('Move controls')).toBeDefined()
  })

  it('should update the cube when clicking a move', async () => {
    const user = userEvent.setup()

    render(<CubePlayground />)

    const upFace = screen.getByLabelText('Up face')
    const stickersBefore = Array.from(upFace.querySelectorAll('[role="img"]')).map(el =>
      el.getAttribute('aria-label')
    )

    const rButton = screen.getByRole('button', { name: 'R' })

    await user.click(rButton)

    const stickersAfter = Array.from(upFace.querySelectorAll('[role="img"]')).map(el =>
      el.getAttribute('aria-label')
    )

    expect(stickersAfter).not.toEqual(stickersBefore)
  })

  it('should render Reset and Scramble buttons', () => {
    render(<CubePlayground />)

    expect(screen.getByRole('button', { name: 'Reset' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Scramble' })).toBeDefined()
  })

  it('should render empty move history', () => {
    render(<CubePlayground />)

    expect(screen.getByText('No moves yet')).toBeDefined()
  })

  it('should show move in history after clicking', async () => {
    const user = userEvent.setup()

    render(<CubePlayground />)

    await user.click(screen.getByRole('button', { name: 'R' }))

    expect(screen.getByLabelText('Move history').querySelector('.badge')).toBeDefined()
    expect(screen.getByText('1 move')).toBeDefined()
  })

  it('should clear everything on Reset', async () => {
    const user = userEvent.setup()

    render(<CubePlayground />)

    await user.click(screen.getByRole('button', { name: 'R' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByText('No moves yet')).toBeDefined()
    expect(screen.queryByText(/moves$/)).toBeNull()
  })

  it('should show 20 history tokens after Scramble', async () => {
    const user = userEvent.setup()

    render(<CubePlayground />)

    await user.click(screen.getByRole('button', { name: 'Scramble' }))

    const history = screen.getByLabelText('Move history')

    expect(history.querySelectorAll('.badge')).toHaveLength(20)
    expect(screen.getByText('20 moves')).toBeDefined()
  })

  it('should return to solved after Scramble then Reset', async () => {
    const user = userEvent.setup()

    render(<CubePlayground />)

    await user.click(screen.getByRole('button', { name: 'Scramble' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByText('No moves yet')).toBeDefined()
  })
})
