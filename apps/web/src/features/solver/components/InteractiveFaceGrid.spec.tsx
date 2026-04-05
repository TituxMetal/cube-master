import type { ColorCode } from '@packages/cube-engine'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, mock } from 'bun:test'

import { InteractiveFaceGrid } from '~/features/solver/components/InteractiveFaceGrid'

const whiteFace: readonly ColorCode[] = ['Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt']

afterEach(() => {
  cleanup()
})

describe('InteractiveFaceGrid', () => {
  it('should render 9 sticker buttons', () => {
    render(
      <InteractiveFaceGrid
        stickers={whiteFace}
        face='U'
        selectedColor='Rd'
        onPaintSticker={() => {}}
      />
    )

    expect(screen.getAllByRole('button')).toHaveLength(9)
  })

  it('should render face label', () => {
    render(
      <InteractiveFaceGrid
        stickers={whiteFace}
        face='U'
        selectedColor='Rd'
        onPaintSticker={() => {}}
      />
    )

    expect(screen.getByLabelText('Up face')).toBeDefined()
  })

  it('should call onPaintSticker when clicking a non-center sticker', async () => {
    const user = userEvent.setup()
    const onPaint = mock(() => {})

    render(
      <InteractiveFaceGrid
        stickers={whiteFace}
        face='F'
        selectedColor='Rd'
        onPaintSticker={onPaint}
      />
    )

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])

    expect(onPaint).toHaveBeenCalledTimes(1)
    expect(onPaint).toHaveBeenCalledWith('F', 0)
  })

  it('should not call onPaintSticker when clicking center sticker', async () => {
    const user = userEvent.setup()
    const onPaint = mock(() => {})

    render(
      <InteractiveFaceGrid
        stickers={whiteFace}
        face='U'
        selectedColor='Rd'
        onPaintSticker={onPaint}
      />
    )

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[4])

    expect(onPaint).toHaveBeenCalledTimes(0)
  })

  it('should disable center sticker button', () => {
    render(
      <InteractiveFaceGrid
        stickers={whiteFace}
        face='U'
        selectedColor='Rd'
        onPaintSticker={() => {}}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect((buttons[4] as HTMLButtonElement).disabled).toBe(true)
  })

  it('should have aria-labels with color names', () => {
    render(
      <InteractiveFaceGrid
        stickers={whiteFace}
        face='U'
        selectedColor='Rd'
        onPaintSticker={() => {}}
      />
    )

    expect(screen.getByLabelText('Up sticker 0: white')).toBeDefined()
    expect(screen.getByLabelText('Up sticker 4: white')).toBeDefined()
  })
})
