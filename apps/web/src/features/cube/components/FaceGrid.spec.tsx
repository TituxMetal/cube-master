import type { ColorCode, FaceCode } from '@packages/cube-engine'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { FaceGrid } from '~/features/cube/components/FaceGrid'

const solvedWhiteFace: readonly ColorCode[] = ['Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt', 'Wt']
const mixedFace: readonly ColorCode[] = ['Rd', 'Gn', 'Bl', 'Og', 'Wt', 'Yl', 'Rd', 'Gn', 'Bl']

afterEach(() => {
  cleanup()
})

describe('FaceGrid', () => {
  it('should render 9 sticker elements', () => {
    render(<FaceGrid stickers={solvedWhiteFace} />)

    expect(screen.getAllByRole('img')).toHaveLength(9)
  })

  it('should set aria-label with color name on each sticker', () => {
    render(<FaceGrid stickers={solvedWhiteFace} />)

    screen.getAllByRole('img').forEach(sticker => {
      expect(sticker.getAttribute('aria-label')).toBe('white')
    })
  })

  it('should apply correct color labels per sticker', () => {
    render(<FaceGrid stickers={mixedFace} />)

    const stickers = screen.getAllByRole('img')

    expect(stickers[0].getAttribute('aria-label')).toBe('red')
    expect(stickers[1].getAttribute('aria-label')).toBe('green')
    expect(stickers[2].getAttribute('aria-label')).toBe('blue')
    expect(stickers[3].getAttribute('aria-label')).toBe('orange')
    expect(stickers[4].getAttribute('aria-label')).toBe('white')
    expect(stickers[5].getAttribute('aria-label')).toBe('yellow')
  })

  it('should render face label when provided', () => {
    const label: FaceCode = 'U'

    render(<FaceGrid stickers={solvedWhiteFace} label={label} />)

    const figure = screen.getByLabelText('Up face')

    expect(figure).toBeDefined()
    expect(figure.querySelector('figcaption')?.textContent).toBe('U')
  })

  it('should not render label when not provided', () => {
    const { container } = render(<FaceGrid stickers={solvedWhiteFace} />)

    expect(container.querySelector('figcaption')).toBeNull()
  })

  it('should throw when stickers array has wrong length', () => {
    const badStickers: readonly ColorCode[] = ['Wt', 'Wt', 'Wt']

    expect(() => {
      render(<FaceGrid stickers={badStickers} />)
    }).toThrow('FaceGrid expects 9 stickers, got 3')
  })

  it('should apply custom className to the figure', () => {
    const { container } = render(
      <FaceGrid stickers={solvedWhiteFace} className='col-start-2 row-start-1' />
    )

    const figure = container.querySelector('figure')

    expect(figure?.className).toContain('col-start-2')
    expect(figure?.className).toContain('row-start-1')
  })

  it('should mark only the highlighted sticker indices', () => {
    const { container } = render(<FaceGrid stickers={mixedFace} highlight={[0, 4]} />)

    const highlighted = container.querySelectorAll('[data-highlighted]')

    expect(highlighted).toHaveLength(2)
  })

  it('should not mark any sticker when no highlight is given', () => {
    const { container } = render(<FaceGrid stickers={mixedFace} />)

    expect(container.querySelectorAll('[data-highlighted]')).toHaveLength(0)
  })

  it('should draw the band arrows on a neighbouring face, not the turning face', () => {
    // An F turn carries U's bottom row (3 stickers) to the right.
    const { container } = render(<FaceGrid stickers={solvedWhiteFace} label='U' activeMove='F' />)

    expect(container.querySelectorAll('[data-cell-arrow]')).toHaveLength(3)
    expect(container.querySelector('[data-rotation-arrow]')).toBeNull()
  })

  it('should draw only a curved rotation arrow on the turning face itself', () => {
    const { container } = render(<FaceGrid stickers={solvedWhiteFace} label='F' activeMove='F' />)

    expect(container.querySelectorAll('[data-cell-arrow]')).toHaveLength(0)
    expect(container.querySelector('[data-rotation-arrow]')).not.toBeNull()
  })

  it('should still draw the band on a half turn (doubles are not arrow-less)', () => {
    const { container } = render(<FaceGrid stickers={solvedWhiteFace} label='U' activeMove='F2' />)

    expect(container.querySelectorAll('[data-cell-arrow]')).toHaveLength(3)
  })

  it('should draw no arrows on a face the move does not touch', () => {
    // An F turn leaves the B face untouched.
    const { container } = render(<FaceGrid stickers={solvedWhiteFace} label='B' activeMove='F' />)

    expect(container.querySelectorAll('[data-cell-arrow]')).toHaveLength(0)
    expect(container.querySelector('[data-rotation-arrow]')).toBeNull()
  })

  it('should veil the non-highlighted stickers when dimming is active', () => {
    const { container } = render(<FaceGrid stickers={mixedFace} highlight={[0, 4]} dimOthers />)

    // 9 stickers, 2 highlighted → 7 veiled.
    expect(container.querySelectorAll('[data-dimmed]')).toHaveLength(7)
  })

  it('should veil the whole face when dimming is active but this face has no highlight', () => {
    const { container } = render(<FaceGrid stickers={mixedFace} dimOthers />)

    expect(container.querySelectorAll('[data-dimmed]')).toHaveLength(9)
  })
})
