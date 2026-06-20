import { getAlgorithm } from '@packages/cube-engine'
import { describe, expect, it } from 'bun:test'

import { LESSONS } from '~/features/coach/data/lessons'
import { stepAlgorithmId, stepCatalogIds, stepScenario } from '~/features/coach/data/types'

// The named states a teaching scenario may travel — the milestones the store can
// resolve. A scenario naming anything else would render a blank cube. (PD-4)
const KNOWN_MILESTONES = new Set([
  'solved',
  'white-cross-only',
  'white-corners',
  'second-layer',
  'yellow-cross'
])
const KNOWN_TEACHING_PHASES = new Set(['white-corners'])

describe('lesson registry', () => {
  it('should have unique lesson ids', () => {
    const ids = LESSONS.map(lesson => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should resolve every referenced catalog id (algorithm + visual case)', () => {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        for (const id of stepCatalogIds(step)) {
          expect(getAlgorithm(id)).toBeDefined()
        }
      }
    }
  })

  it('should give every lesson at least one step', () => {
    for (const lesson of LESSONS) {
      expect(lesson.steps.length).toBeGreaterThan(0)
    }
  })

  // NFR-004 / PD-4 — anti-drift: every demo/practice resolves to a catalog id OR a
  // valid teaching scenario; lesson data never inlines a move sequence.
  it('should ground every demo/practice in a catalog id or a valid teaching scenario', () => {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        if (step.kind !== 'demo' && step.kind !== 'practice' && step.kind !== 'chapter-practice') {
          continue
        }
        const scenario = stepScenario(step)
        if (scenario === null) {
          // legacy: a single catalog algorithm
          const id = stepAlgorithmId(step)
          expect(id).not.toBeNull()
          expect(getAlgorithm(id!)).toBeDefined()
        } else {
          expect(KNOWN_TEACHING_PHASES.has(scenario.phase)).toBe(true)
          expect(KNOWN_MILESTONES.has(scenario.from)).toBe(true)
          expect(KNOWN_MILESTONES.has(scenario.to)).toBe(true)
        }
      }
    }
  })

  it('should never inline a raw move sequence (only the Ch0 notation primer carries moves)', () => {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        if (step.kind === 'interactive') continue // the notation alphabet — the one allowed exception
        expect('moves' in step).toBe(false)
      }
    }
  })
})
