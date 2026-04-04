import { CubePlayground } from '~/features/cube/components/CubePlayground'
import { Link } from '~/lib/router'

const MODE_CARDS = [
  {
    path: '/solver',
    label: 'Solver',
    color: 'border-cube-blue',
    description: 'Input your cube state and get an optimal solution.'
  },
  {
    path: '/coach',
    label: 'Coach',
    color: 'border-cube-green',
    description: 'Learn algorithms and improve your solving skills.'
  },
  {
    path: '/timer',
    label: 'Timer',
    color: 'border-cube-red',
    description: 'Track your solve times and monitor your progress.'
  }
] as const

export const Home = () => (
  <div className='space-y-8'>
    <ul className='grid grid-cols-1 gap-4 md:grid-cols-3'>
      {MODE_CARDS.map(card => (
        <li key={card.path}>
          <Link
            to={card.path}
            className={`card bg-base-200 focus-visible:ring-info border-l-4 no-underline shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:outline-none ${card.color}`}
          >
            <article className='card-body'>
              <h2 className='card-title'>{card.label}</h2>
              <p>{card.description}</p>
            </article>
          </Link>
        </li>
      ))}
    </ul>
    <CubePlayground />
  </div>
)
