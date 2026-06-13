import { describe, expect, it } from 'bun:test'

import { getAlgorithm } from '~/domain'

import { SECOND_LAYER_INSERT_LEFT, SECOND_LAYER_INSERT_RIGHT } from './solveSecondLayer'
import { SEXY_MOVE } from './solveWhiteCorners'
import { CORNER_3_CYCLE } from './solveYellowCorners'

// The four promoted entries the solver does NOT consume structurally (D2/D5):
// the catalog holds a canonical form while the solver keeps its own literal.
// These deep-equal checks pin each catalog entry to the *live* solver constant
// it was extracted from — edit one without the other and CI reddens (no drift).
const PARITY_CASES = [
  { id: 'sexy-move', constant: SEXY_MOVE },
  { id: 'second-layer-insert-right', constant: SECOND_LAYER_INSERT_RIGHT },
  { id: 'second-layer-insert-left', constant: SECOND_LAYER_INSERT_LEFT },
  { id: 'corner-3-cycle', constant: CORNER_3_CYCLE }
] as const

describe('catalog ↔ solver parity', () => {
  for (const { id, constant } of PARITY_CASES) {
    it(`catalog '${id}' equals the live solver constant`, () => {
      const entry = getAlgorithm(id)
      expect(entry).toBeDefined()
      expect(entry?.moves).toEqual(constant)
    })
  }
})
