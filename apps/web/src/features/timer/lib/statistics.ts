import type { Solve } from '~/features/timer/stores'

export const computeBest = (solves: readonly Solve[]): number | null => {
  let best: number | null = null

  for (const solve of solves) {
    if (solve.dnf) continue
    if (best === null || solve.time < best) best = solve.time
  }

  return best
}

export const computeWorst = (solves: readonly Solve[]): number | null => {
  let worst: number | null = null

  for (const solve of solves) {
    if (solve.dnf) continue
    if (worst === null || solve.time > worst) worst = solve.time
  }

  return worst
}

export const computeAverage = (solves: readonly Solve[], count: 5 | 12): number | null => {
  if (solves.length < count) return null

  const recent = solves.slice(0, count)
  const times = recent.map(s => (s.dnf ? Infinity : s.time))
  const sorted = [...times].sort((a, b) => a - b)
  const trimmed = sorted.slice(1, -1)

  if (trimmed.some(t => t === Infinity)) return null

  return trimmed.reduce((sum, t) => sum + t, 0) / trimmed.length
}
