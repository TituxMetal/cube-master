import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'bun:test'

import { CubeDemo } from '~/features/cube/components/CubeDemo'

afterEach(() => {
  cleanup()
})

describe('CubeDemo', () => {
  it('should render the heading', () => {
    render(<CubeDemo />)

    expect(screen.getByText('CubeMaster — Engine Demo')).toBeDefined()
  })

  it('should render the CubeNet with 54 stickers', () => {
    render(<CubeDemo />)

    expect(screen.getByLabelText('Cube state')).toBeDefined()
    expect(screen.getAllByRole('img')).toHaveLength(54)
  })

  it('should render all 6 faces of the cube', () => {
    render(<CubeDemo />)

    expect(screen.getByLabelText('Up face')).toBeDefined()
    expect(screen.getByLabelText('Down face')).toBeDefined()
    expect(screen.getByLabelText('Front face')).toBeDefined()
    expect(screen.getByLabelText('Back face')).toBeDefined()
    expect(screen.getByLabelText('Left face')).toBeDefined()
    expect(screen.getByLabelText('Right face')).toBeDefined()
  })

  it('should render a solved cube with correct face colors', () => {
    render(<CubeDemo />)

    const upFace = screen.getByLabelText('Up face')

    upFace.querySelectorAll('[role="img"]').forEach(sticker => {
      expect(sticker.getAttribute('aria-label')).toBe('white')
    })

    const downFace = screen.getByLabelText('Down face')

    downFace.querySelectorAll('[role="img"]').forEach(sticker => {
      expect(sticker.getAttribute('aria-label')).toBe('yellow')
    })
  })
})
