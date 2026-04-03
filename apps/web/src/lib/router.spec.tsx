import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { Link, Router, navigate } from '~/lib/router'

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
