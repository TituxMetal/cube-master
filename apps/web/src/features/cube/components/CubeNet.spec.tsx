import { createSolvedState, toStickers } from '@packages/cube-engine'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { CubeNet } from '~/features/cube/components/CubeNet'

const solvedStickers = toStickers(createSolvedState())

afterEach(() => {
  cleanup()
})

describe('CubeNet', () => {
  it('should render all 6 faces', () => {
    render(<CubeNet stickersByFace={solvedStickers} />)

    expect(screen.getByLabelText('Up face')).toBeDefined()
    expect(screen.getByLabelText('Down face')).toBeDefined()
    expect(screen.getByLabelText('Front face')).toBeDefined()
    expect(screen.getByLabelText('Back face')).toBeDefined()
    expect(screen.getByLabelText('Left face')).toBeDefined()
    expect(screen.getByLabelText('Right face')).toBeDefined()
  })

  it('should render 54 stickers total (9 per face)', () => {
    render(<CubeNet stickersByFace={solvedStickers} />)

    expect(screen.getAllByRole('img')).toHaveLength(54)
  })

  it('should render within a section with cube state aria-label', () => {
    render(<CubeNet stickersByFace={solvedStickers} />)

    const section = screen.getByLabelText('Cube state')

    expect(section.tagName).toBe('SECTION')
  })

  it('should render correct colors for a solved cube', () => {
    render(<CubeNet stickersByFace={solvedStickers} />)

    const upFace = screen.getByLabelText('Up face')

    upFace.querySelectorAll('[role="img"]').forEach(sticker => {
      expect(sticker.getAttribute('aria-label')).toBe('white')
    })

    const frontFace = screen.getByLabelText('Front face')

    frontFace.querySelectorAll('[role="img"]').forEach(sticker => {
      expect(sticker.getAttribute('aria-label')).toBe('green')
    })
  })

  it('should mark highlighted stickers on the named face only', () => {
    const { container } = render(
      <CubeNet stickersByFace={solvedStickers} highlight={{ U: [0, 1] }} />
    )

    const upFace = screen.getByLabelText('Up face')

    expect(upFace.querySelectorAll('[data-highlighted]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-highlighted]')).toHaveLength(2)
  })

  it('should draw the active-move arrow on the affected face', () => {
    render(<CubeNet stickersByFace={solvedStickers} activeMove="R'" />)

    expect(screen.getByLabelText("turn R' counter-clockwise")).toBeDefined()
  })

  it('should render face labels for all faces', () => {
    const { container } = render(<CubeNet stickersByFace={solvedStickers} />)

    const figcaptions = container.querySelectorAll('figcaption')

    expect(figcaptions).toHaveLength(6)

    const captionTexts = Array.from(figcaptions).map(fc => fc.textContent)

    expect(captionTexts).toContain('U')
    expect(captionTexts).toContain('D')
    expect(captionTexts).toContain('F')
    expect(captionTexts).toContain('B')
    expect(captionTexts).toContain('L')
    expect(captionTexts).toContain('R')
  })
})
