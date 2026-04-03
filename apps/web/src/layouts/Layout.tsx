import { Coffee, Copyleft, Heart } from 'lucide-react'
import type { ReactNode } from 'react'

import { Link, useCurrentPath } from '~/lib/router'

const MODES = [
  { path: '/solver', label: 'Solver', color: 'text-cube-blue-text' },
  { path: '/coach', label: 'Coach', color: 'text-cube-green-text' },
  { path: '/timer', label: 'Timer', color: 'text-cube-red-text' }
] as const

const GITHUB_URL = 'https://github.com/Lgdweb'

const SkipToContent = () => (
  <a
    href='#main-content'
    className='bg-primary text-primary-content sr-only rounded px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50'
  >
    Skip to content
  </a>
)

const Navbar = () => {
  const currentPath = useCurrentPath()

  return (
    <header className='bg-base-200 shadow-sm'>
      <nav
        aria-label='Main navigation'
        className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3'
      >
        <Link
          to='/'
          className='focus-visible:ring-info rounded text-xl font-bold focus-visible:ring-2 focus-visible:outline-none'
        >
          CubeMaster
        </Link>
        <ul aria-label='Mode navigation' className='flex gap-4'>
          {MODES.map(mode => {
            const isActive = currentPath === mode.path

            return (
              <li key={mode.path}>
                <Link
                  to={mode.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`focus-visible:ring-info rounded px-2 py-1 transition-colors focus-visible:ring-2 focus-visible:outline-none ${isActive ? `${mode.color} font-bold` : 'hover:text-base-content/80'}`}
                >
                  {mode.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}

const Footer = () => (
  <footer className='bg-base-200 p-6 text-center' role='contentinfo'>
    <p className='flex items-center justify-center gap-1'>
      <Copyleft size={16} role='img' aria-label='Copyleft' />
      {new Date().getFullYear()} CubeMaster.
    </p>
    <p className='mt-1 flex items-center justify-center gap-1'>
      Built by{' '}
      <a
        href={GITHUB_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='link link-info focus-visible:ring-info rounded focus-visible:ring-2 focus-visible:outline-none'
      >
        Lgdweb
        <span className='sr-only'> (opens in new tab)</span>
      </a>{' '}
      with <Heart size={16} role='img' aria-label='love' className='text-cube-red-text' /> and lots
      of <Coffee size={16} role='img' aria-label='coffee' className='text-cube-orange-text' />.
    </p>
  </footer>
)

export const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <SkipToContent />
    <Navbar />
    <main id='main-content' className='mx-auto w-full max-w-5xl flex-1 px-4 py-6'>
      {children}
    </main>
    <Footer />
  </>
)
