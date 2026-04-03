import type { CubeState } from '../state'

import { MOVE_TABLES } from './tables'
import type { BaseFace, MoveToken } from './tokens'

const parseMove = (move: MoveToken): { base: BaseFace; times: 1 | 2 | 3 } => {
  const base = move[0] as BaseFace

  if (move[1] === '2') return { base, times: 2 }
  if (move[1] === "'") return { base, times: 3 }

  return { base, times: 1 }
}

const applyCycleToPieces = <T extends { position: string; orientation: number }>(
  pieces: Record<string, T>,
  cycle: readonly [string, string, string, string],
  deltas: readonly [number, number, number, number],
  mod: number
): Record<string, T> => {
  const pieceA = pieces[cycle[0]]
  const pieceB = pieces[cycle[1]]
  const pieceC = pieces[cycle[2]]
  const pieceD = pieces[cycle[3]]

  return {
    ...pieces,
    [cycle[1]]: {
      ...pieceA,
      position: cycle[1],
      orientation: (pieceA.orientation + deltas[0]) % mod
    },
    [cycle[2]]: {
      ...pieceB,
      position: cycle[2],
      orientation: (pieceB.orientation + deltas[1]) % mod
    },
    [cycle[3]]: {
      ...pieceC,
      position: cycle[3],
      orientation: (pieceC.orientation + deltas[2]) % mod
    },
    [cycle[0]]: {
      ...pieceD,
      position: cycle[0],
      orientation: (pieceD.orientation + deltas[3]) % mod
    }
  }
}

export const applyMove = (state: CubeState, move: MoveToken): CubeState => {
  const { base, times } = parseMove(move)
  const table = MOVE_TABLES[base]
  let { corners, edges } = state

  for (let i = 0; i < times; i++) {
    corners = applyCycleToPieces(corners, table.cornerCycle, table.cornerOrientationDeltas, 3)
    edges = applyCycleToPieces(edges, table.edgeCycle, table.edgeOrientationDeltas, 2)
  }

  return { corners, edges, centers: state.centers }
}
