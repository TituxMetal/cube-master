import { formatTime } from '~/features/timer/lib/formatTime'
import { computeAverage, computeBest, computeWorst } from '~/features/timer/lib/statistics'
import type { Solve } from '~/features/timer/stores/sessionStore'

interface StatsPanelProps {
  solves: readonly Solve[]
}

const formatStat = (value: number | null): string => {
  if (value === null) return '\u2014'

  return formatTime(value)
}

export const StatsPanel = ({ solves }: StatsPanelProps) => {
  const mutableSolves = solves as Solve[]
  const best = computeBest(mutableSolves)
  const worst = computeWorst(mutableSolves)
  const ao5 = computeAverage(mutableSolves, 5)
  const ao12 = computeAverage(mutableSolves, 12)

  const stats = [
    { label: 'Best', value: formatStat(best) },
    { label: 'Worst', value: formatStat(worst) },
    { label: 'Ao5', value: formatStat(ao5) },
    { label: 'Ao12', value: formatStat(ao12) }
  ]

  return (
    <section aria-label='Statistics' className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {stats.map(stat => (
        <article key={stat.label} className='stat bg-cube-orange/40 rounded-lg p-4'>
          <p className='stat-title text-base-content'>{stat.label}</p>
          <p className='stat-value font-mono text-xl'>{stat.value}</p>
        </article>
      ))}
    </section>
  )
}
