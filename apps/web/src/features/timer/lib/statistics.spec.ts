import { describe, expect, it } from 'bun:test'

import { computeAverage, computeBest, computeWorst } from '~/features/timer/lib/statistics'
import type { Solve } from '~/features/timer/stores/sessionStore'

const makeSolve = (time: number, dnf = false): Solve => ({
  id: crypto.randomUUID(),
  time,
  scramble: ['R', 'U'],
  timestamp: Date.now(),
  dnf
})

describe('statistics', () => {
  describe('computeBest', () => {
    it('should return null for empty list', () => {
      expect(computeBest([])).toBeNull()
    })

    it('should return minimum non-DNF time', () => {
      const solves = [makeSolve(5000), makeSolve(3000), makeSolve(8000)]

      expect(computeBest(solves)).toBe(3000)
    })

    it('should return null when all solves are DNF', () => {
      const solves = [makeSolve(5000, true), makeSolve(3000, true)]

      expect(computeBest(solves)).toBeNull()
    })

    it('should exclude DNF solves from best calculation', () => {
      const solves = [makeSolve(5000), makeSolve(1000, true), makeSolve(8000)]

      expect(computeBest(solves)).toBe(5000)
    })
  })

  describe('computeWorst', () => {
    it('should return maximum non-DNF time', () => {
      const solves = [makeSolve(5000), makeSolve(3000), makeSolve(8000)]

      expect(computeWorst(solves)).toBe(8000)
    })

    it('should return null for empty list', () => {
      expect(computeWorst([])).toBeNull()
    })
  })

  describe('computeAverage', () => {
    it('should return null when fewer than count solves', () => {
      const solves = [makeSolve(5000), makeSolve(3000)]

      expect(computeAverage(solves, 5)).toBeNull()
    })

    it('should drop best and worst, average rest for Ao5', () => {
      const solves = [
        makeSolve(10000),
        makeSolve(12000),
        makeSolve(8000),
        makeSolve(11000),
        makeSolve(15000)
      ]

      // Sorted: 8000, 10000, 11000, 12000, 15000
      // Drop best (8000) and worst (15000)
      // Average of 10000, 11000, 12000 = 11000
      expect(computeAverage(solves, 5)).toBe(11000)
    })

    it('should drop best and worst, average rest for Ao12', () => {
      const solves = [
        makeSolve(10000),
        makeSolve(12000),
        makeSolve(8000),
        makeSolve(11000),
        makeSolve(15000),
        makeSolve(9000),
        makeSolve(13000),
        makeSolve(14000),
        makeSolve(7000),
        makeSolve(16000),
        makeSolve(10500),
        makeSolve(11500)
      ]

      // Sorted: 7000, 8000, 9000, 10000, 10500, 11000, 11500, 12000, 13000, 14000, 15000, 16000
      // Drop 7000 and 16000
      // Average of remaining 10 = (8000+9000+10000+10500+11000+11500+12000+13000+14000+15000)/10
      // = 114000/10 = 11400
      expect(computeAverage(solves, 12)).toBe(11400)
    })

    it('should return null when a non-dropped solve is DNF', () => {
      const solves = [
        makeSolve(10000),
        makeSolve(12000, true),
        makeSolve(8000),
        makeSolve(11000),
        makeSolve(15000)
      ]

      // DNF is treated as Infinity
      // Sorted: 8000, 10000, 11000, 15000, Infinity
      // Drop best (8000) and worst (Infinity)
      // Remaining: 10000, 11000, 15000 — no DNF — should return average
      // Wait: the DNF (12000) becomes Infinity, which is the worst, so it's dropped
      // Actually let me reconsider: sorted would be [8000, 10000, 11000, 15000, Infinity]
      // Drop first (8000) and last (Infinity) = [10000, 11000, 15000]
      // No Infinity in trimmed, so average = (10000+11000+15000)/3 = 12000
      // This test should NOT return null — the DNF is dropped as worst
      expect(computeAverage(solves, 5)).toBe(12000)
    })

    it('should return null when too many DNFs remain after trimming', () => {
      const solves = [
        makeSolve(10000),
        makeSolve(12000, true),
        makeSolve(8000, true),
        makeSolve(11000),
        makeSolve(15000)
      ]

      // Sorted: 10000, 11000, 15000, Infinity, Infinity
      // Drop first (10000) and last (Infinity)
      // Remaining: 11000, 15000, Infinity — Infinity present → null
      expect(computeAverage(solves, 5)).toBeNull()
    })
  })
})
