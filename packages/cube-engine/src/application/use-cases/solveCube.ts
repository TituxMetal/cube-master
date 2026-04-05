import type { CubeState, MoveToken } from '~/domain'

import { solveSecondLayer } from '../solver/solveSecondLayer'
import { solveWhiteCorners } from '../solver/solveWhiteCorners'
import { solveWhiteCross } from '../solver/solveWhiteCross'
import { solveYellowCorners } from '../solver/solveYellowCorners'
import { solveYellowCross } from '../solver/solveYellowCross'
import type { Solution } from '../solver/types'

const PHASES: {
  name: string
  solve: (state: CubeState) => { state: CubeState; moves: MoveToken[] }
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
    totalMoves += result.moves.length

    if (totalMoves > MAX_MOVES) {
      throw new Error(`Solver exceeded ${MAX_MOVES} moves — likely infinite loop`)
    }

    return { name, moves: result.moves }
  })

  return { phases, totalMoves }
}
