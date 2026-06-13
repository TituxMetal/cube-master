import { getAlgorithm } from '@packages/cube-engine'
import { describe, expect, it } from 'bun:test'

import { LESSONS } from '~/features/coach/data/lessons'
import { stepAlgorithmId } from '~/features/coach/data/types'

describe('lesson registry', () => {
  it('should have unique lesson ids', () => {
    const ids = LESSONS.map(lesson => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should resolve every referenced algorithm id in the catalog', () => {
    for (const lesson of LESSONS) {
      for (const step of lesson.steps) {
        const algorithmId = stepAlgorithmId(step)
        if (algorithmId !== null) {
          expect(getAlgorithm(algorithmId)).toBeDefined()
        }
      }
    }
  })

  it('should give every lesson at least one step', () => {
    for (const lesson of LESSONS) {
      expect(lesson.steps.length).toBeGreaterThan(0)
    }
  })
})
