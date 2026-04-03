import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'

type RouteMap = Record<string, () => ReactNode>

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
  const render = routes[pathname] ?? fallback ?? (() => null)
  return <>{render()}</>
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
