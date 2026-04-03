import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { Layout } from '~/layouts/Layout'

beforeEach(() => {
  window.history.pushState(null, '', '/')
})

afterEach(() => {
  cleanup()
})

describe('Layout', () => {
  it('should render the navbar with CubeMaster brand', () => {
    render(<Layout>content</Layout>)
    expect(screen.getByText('CubeMaster')).toBeDefined()
  })

  it('should render mode tabs', () => {
    render(<Layout>content</Layout>)
    expect(screen.getByText('Solver')).toBeDefined()
    expect(screen.getByText('Coach')).toBeDefined()
    expect(screen.getByText('Timer')).toBeDefined()
  })

  it('should render children in the main content area', () => {
    render(
      <Layout>
        <p>Test Content</p>
      </Layout>
    )
    expect(screen.getByText('Test Content')).toBeDefined()
  })

  it('should render the footer with copyleft and credits', () => {
    render(<Layout>content</Layout>)
    expect(screen.getByText(/CubeMaster\./)).toBeDefined()
    expect(screen.getByText(/Built by/)).toBeDefined()
  })

  it('should render mode tab links with correct hrefs', () => {
    render(<Layout>content</Layout>)
    const solverLink = screen.getByText('Solver').closest('a')
    const coachLink = screen.getByText('Coach').closest('a')
    const timerLink = screen.getByText('Timer').closest('a')

    expect(solverLink?.getAttribute('href')).toBe('/solver')
    expect(coachLink?.getAttribute('href')).toBe('/coach')
    expect(timerLink?.getAttribute('href')).toBe('/timer')
  })

  it('should render Lgdweb as a link to GitHub', () => {
    render(<Layout>content</Layout>)
    const lgdwebLink = screen.getByText('Lgdweb').closest('a')

    expect(lgdwebLink?.getAttribute('href')).toBe('https://github.com/Lgdweb')
    expect(lgdwebLink?.getAttribute('target')).toBe('_blank')
    expect(lgdwebLink?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('should render icons with accessible labels', () => {
    render(<Layout>content</Layout>)
    expect(screen.getByLabelText('Copyleft')).toBeDefined()
    expect(screen.getByLabelText('love')).toBeDefined()
    expect(screen.getByLabelText('coffee')).toBeDefined()
  })

  it('should render a skip-to-content link', () => {
    render(<Layout>content</Layout>)
    const skipLink = screen.getByText('Skip to content')

    expect(skipLink.getAttribute('href')).toBe('#main-content')
  })

  it('should mark the main content area with id for skip link', () => {
    render(<Layout>content</Layout>)
    const main = document.getElementById('main-content')

    expect(main).toBeDefined()
    expect(main?.tagName).toBe('MAIN')
  })

  it('should have aria-label on navigation', () => {
    render(<Layout>content</Layout>)
    const nav = screen.getByRole('navigation', { name: 'Main navigation' })

    expect(nav).toBeDefined()
  })

  it('should indicate external link opens in new tab for screen readers', () => {
    render(<Layout>content</Layout>)
    expect(screen.getByText('(opens in new tab)')).toBeDefined()
  })
})
