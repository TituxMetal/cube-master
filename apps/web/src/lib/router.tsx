import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

export type RouteParams = Record<string, string>
type RouteRender = (params: RouteParams) => ReactNode
export type RouteMap = Record<string, RouteRender>

// Strip a trailing slash (except on root) so `/coach/` resolves to `/coach`.
const normalizePath = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname

// Resolve a path against the route map: exact static routes win first, then a
// single-segment `:param` pattern pass. Returns null when nothing matches.
export const matchRoute = (
  routes: RouteMap,
  pathname: string
): { render: RouteRender; params: RouteParams } | null => {
  const path = normalizePath(pathname)

  const exact = routes[path]
  if (exact) return { render: exact, params: {} }

  const segments = path.split('/')
  for (const [pattern, render] of Object.entries(routes)) {
    if (!pattern.includes(':')) continue

    const patternSegments = pattern.split('/')
    if (patternSegments.length !== segments.length) continue

    const params: RouteParams = {}
    let matched = true
    for (let i = 0; i < patternSegments.length; i++) {
      const expected = patternSegments[i]
      const actual = segments[i]
      if (expected.startsWith(':')) {
        if (actual === '') {
          matched = false
          break
        }
        try {
          params[expected.slice(1)] = decodeURIComponent(actual)
        } catch {
          return null
        }
      } else if (expected !== actual) {
        matched = false
        break
      }
    }

    if (matched) return { render, params }
  }

  return null
}

const subscribers = new Set<() => void>()

const notifySubscribers = () => {
  for (const callback of subscribers) {
    callback()
  }
}

export const navigate = (to: string) => {
  if (to === window.location.pathname) return
  window.history.pushState(null, '', to)
  notifySubscribers()
}

const usePathname = () => {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const update = () => setPathname(window.location.pathname)

    subscribers.add(update)
    window.addEventListener('popstate', update)

    return () => {
      subscribers.delete(update)
      window.removeEventListener('popstate', update)
    }
  }, [])

  return pathname
}

export const Router = ({ routes, fallback }: { routes: RouteMap; fallback?: () => ReactNode }) => {
  const pathname = usePathname()
  const match = matchRoute(routes, pathname)
  if (match) return <>{match.render(match.params)}</>
  return <>{(fallback ?? (() => null))()}</>
}

export const Link = ({
  to,
  children,
  className,
  ...props
}: {
  to: string
  children: ReactNode
  className?: string
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      navigate(to)
    },
    [to]
  )

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  )
}

export const useCurrentPath = () => usePathname()
