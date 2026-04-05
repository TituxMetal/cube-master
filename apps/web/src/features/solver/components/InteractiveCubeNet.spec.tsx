import { createSolvedState, toStickers } from '@packages/cube-engine'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { InteractiveCubeNet } from '~/features/solver/components/InteractiveCubeNet'

const solvedStickers = toStickers(createSolvedState())

afterEach(() => {
  cleanup()
})

describe('InteractiveCubeNet', () => {
  it('should render all 6 faces', () => {
    render(
      <InteractiveCubeNet stickers={solvedStickers} selectedColor='Rd' onPaintSticker={() => {}} />
    )

    expect(screen.getByLabelText('Up face')).toBeDefined()
    expect(screen.getByLabelText('Down face')).toBeDefined()
    expect(screen.getByLabelText('Front face')).toBeDefined()
    expect(screen.getByLabelText('Back face')).toBeDefined()
    expect(screen.getByLabelText('Left face')).toBeDefined()
    expect(screen.getByLabelText('Right face')).toBeDefined()
  })

  it('should render 54 sticker buttons total', () => {
    render(
      <InteractiveCubeNet stickers={solvedStickers} selectedColor='Rd' onPaintSticker={() => {}} />
    )

    expect(screen.getAllByRole('button')).toHaveLength(54)
  })

  it('should call onPaintSticker with correct face and index', async () => {
    const user = userEvent.setup()
    const onPaint = mock(() => {})

    render(
      <InteractiveCubeNet stickers={solvedStickers} selectedColor='Rd' onPaintSticker={onPaint} />
    )

    const upFace = screen.getByLabelText('Up face')
    const buttons = upFace.querySelectorAll('button')
    await user.click(buttons[0])

    expect(onPaint).toHaveBeenCalledWith('U', 0)
  })
})
