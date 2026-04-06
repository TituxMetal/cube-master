import type { CubeState } from '~/domain'

import { solveSecondLayer } from '../solver/solveSecondLayer'
import { solveWhiteCorners } from '../solver/solveWhiteCorners'
import { solveWhiteCross } from '../solver/solveWhiteCross'
import { solveYellowCorners } from '../solver/solveYellowCorners'
import { solveYellowCross } from '../solver/solveYellowCross'
import type { MoveGroup, Solution } from '../solver/types'

const PHASES: {
  name: string
  solve: (state: CubeState) => { state: CubeState; groups: MoveGroup[] }
}[] = [
  { name: 'White Cross', solve: solveWhiteCross },
  { name: 'White Corners', solve: solveWhiteCorners },
  { name: 'Second Layer', solve: solveSecondLayer },
  { name: 'Yellow Cross', solve: solveYellowCross },
  { name: 'Yellow Layer', solve: solveYellowCorners }
]

const MAX_MOVES = 300

export const solveCube = (state: CubeState): Solution => {
  let current = state
  let totalMoves = 0

  const phases = PHASES.map(({ name, solve }) => {
    const result = solve(current)
    current = result.state
    const phaseMoves = result.groups.reduce((sum, g) => sum + g.moves.length, 0)
    totalMoves += phaseMoves

    if (totalMoves > MAX_MOVES) {
      throw new Error(`Solver exceeded ${MAX_MOVES} moves — likely infinite loop`)
    }

    return { name, groups: result.groups }
  })

  return { phases, totalMoves }
}
