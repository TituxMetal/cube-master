import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { Link, Router, matchRoute, navigate } from '~/lib/router'

const TestHome = () => <div>Home Page</div>
const TestAbout = () => <div>About Page</div>

const routes = {
  '/': () => <TestHome />,
  '/about': () => <TestAbout />
}

const NotFound = () => <div>Not Found</div>

beforeEach(() => {
  window.history.pushState(null, '', '/')
})

afterEach(() => {
  cleanup()
})

describe('Router', () => {
  it('should render the correct page for the current path', () => {
    render(<Router routes={routes} />)
    expect(screen.getByText('Home Page')).toBeDefined()
  })

  it('should render a different page when path changes', () => {
    window.history.pushState(null, '', '/about')
    render(<Router routes={routes} />)
    expect(screen.getByText('About Page')).toBeDefined()
  })

  it('should render fallback for unknown routes', () => {
    window.history.pushState(null, '', '/unknown')
    render(<Router routes={routes} fallback={() => <NotFound />} />)
    expect(screen.getByText('Not Found')).toBeDefined()
  })

  it('should render nothing for unknown routes without fallback', () => {
    window.history.pushState(null, '', '/unknown')
    const { container } = render(<Router routes={routes} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('Router param matching', () => {
  const CoachBrowser = () => <div>Coach Browser</div>
  const CoachPlayer = ({ lessonId }: { lessonId: string }) => <div>Lesson {lessonId}</div>

  const paramRoutes = {
    '/coach': () => <CoachBrowser />,
    '/coach/:lessonId': (params: Record<string, string>) => (
      <CoachPlayer lessonId={params.lessonId} />
    )
  }

  it('should extract a single-segment param and pass it to the render', () => {
    window.history.pushState(null, '', '/coach/second-layer')
    render(<Router routes={paramRoutes} fallback={() => <NotFound />} />)
    expect(screen.getByText('Lesson second-layer')).toBeDefined()
  })

  it('should prefer an exact static route over a dynamic pattern', () => {
    window.history.pushState(null, '', '/coach')
    render(<Router routes={paramRoutes} fallback={() => <NotFound />} />)
    expect(screen.getByText('Coach Browser')).toBeDefined()
  })

  it('should resolve a trailing slash to the static route, not an empty param', () => {
    window.history.pushState(null, '', '/coach/')
    render(<Router routes={paramRoutes} fallback={() => <NotFound />} />)
    expect(screen.getByText('Coach Browser')).toBeDefined()
  })

  it('should fall back when no static or dynamic route matches', () => {
    window.history.pushState(null, '', '/coach/a/b')
    render(<Router routes={paramRoutes} fallback={() => <NotFound />} />)
    expect(screen.getByText('Not Found')).toBeDefined()
  })
})

describe('Link', () => {
  it('should render an anchor element with correct href', () => {
    render(
      <Link to='/about' data-testid='link'>
        Go
      </Link>
    )
    const link = screen.getByTestId('link')
    expect(link.getAttribute('href')).toBe('/about')
  })

  it('should navigate without page reload on click', async () => {
    const user = userEvent.setup()

    render(
      <>
        <Link to='/about' data-testid='nav-link'>
          Go to About
        </Link>
        <Router routes={routes} />
      </>
    )

    expect(screen.getByText('Home Page')).toBeDefined()

    await user.click(screen.getByTestId('nav-link'))

    expect(window.location.pathname).toBe('/about')
    expect(screen.getByText('About Page')).toBeDefined()
  })
})

describe('navigate', () => {
  it('should update the pathname', async () => {
    render(<Router routes={routes} />)
    expect(screen.getByText('Home Page')).toBeDefined()

    navigate('/about')

    expect(window.location.pathname).toBe('/about')
    await waitFor(() => {
      expect(screen.getByText('About Page')).toBeDefined()
    })
  })

  it('should not navigate when already on target path', () => {
    navigate('/')
    expect(window.location.pathname).toBe('/')
  })
})

describe('matchRoute', () => {
  const render = (): null => null

  it('decodes a percent-encoded dynamic param so white%2Dcross matches white-cross', () => {
    const result = matchRoute({ '/coach/:id': render }, '/coach/white%2Dcross')
    expect(result).not.toBeNull()
    expect(result?.params).toEqual({ id: 'white-cross' })
  })

  it('leaves an already-decoded param unchanged', () => {
    const result = matchRoute({ '/coach/:id': render }, '/coach/white-cross')
    expect(result).not.toBeNull()
    expect(result?.params).toEqual({ id: 'white-cross' })
  })
})
