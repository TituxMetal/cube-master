import type { Solve } from '~/features/timer/stores/sessionStore'

export const computeBest = (solves: Solve[]): number | null => {
  const validTimes = solves.filter(s => !s.dnf).map(s => s.time)

  if (validTimes.length === 0) return null

  return Math.min(...validTimes)
}

export const computeWorst = (solves: Solve[]): number | null => {
  const validTimes = solves.filter(s => !s.dnf).map(s => s.time)

  if (validTimes.length === 0) return null

  return Math.max(...validTimes)
}

export const computeAverage = (solves: Solve[], count: 5 | 12): number | null => {
  if (solves.length < count) return null

  const recent = solves.slice(0, count)
  const times = recent.map(s => (s.dnf ? Infinity : s.time))
  const sorted = [...times].sort((a, b) => a - b)
  const trimmed = sorted.slice(1, -1)

  if (trimmed.some(t => t === Infinity)) return null

  return trimmed.reduce((sum, t) => sum + t, 0) / trimmed.length
}
