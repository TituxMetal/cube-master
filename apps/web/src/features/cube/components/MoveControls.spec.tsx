import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { MoveControls } from '~/features/cube/components/MoveControls'

afterEach(() => {
  cleanup()
})

describe('MoveControls', () => {
  it('should render all 18 move buttons', () => {
    render(<MoveControls onMove={() => {}} />)

    expect(screen.getAllByRole('button')).toHaveLength(18)
  })

  it('should render 6 face groups', () => {
    render(<MoveControls onMove={() => {}} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(6)
  })

  it('should have correct aria-labels on groups', () => {
    render(<MoveControls onMove={() => {}} />)

    expect(screen.getByLabelText('Up face moves')).toBeDefined()
    expect(screen.getByLabelText('Down face moves')).toBeDefined()
    expect(screen.getByLabelText('Front face moves')).toBeDefined()
    expect(screen.getByLabelText('Back face moves')).toBeDefined()
    expect(screen.getByLabelText('Left face moves')).toBeDefined()
    expect(screen.getByLabelText('Right face moves')).toBeDefined()
  })

  it('should display correct move notation', () => {
    render(<MoveControls onMove={() => {}} />)

    expect(screen.getByRole('button', { name: 'R' })).toBeDefined()
    expect(screen.getByRole('button', { name: "R'" })).toBeDefined()
    expect(screen.getByRole('button', { name: 'R2' })).toBeDefined()
  })

  it('should call onMove with correct token on click', async () => {
    const user = userEvent.setup()
    const onMove = mock(() => {})

    render(<MoveControls onMove={onMove} />)

    await user.click(screen.getByRole('button', { name: 'R' }))

    expect(onMove).toHaveBeenCalledWith('R')
  })

  it('should pass correct token for prime moves', async () => {
    const user = userEvent.setup()
    const onMove = mock(() => {})

    render(<MoveControls onMove={onMove} />)

    await user.click(screen.getByText("U'"))

    expect(onMove).toHaveBeenCalledWith("U'")
  })

  it('should pass correct token for double moves', async () => {
    const user = userEvent.setup()
    const onMove = mock(() => {})

    render(<MoveControls onMove={onMove} />)

    await user.click(screen.getByText('F2'))

    expect(onMove).toHaveBeenCalledWith('F2')
  })
})
