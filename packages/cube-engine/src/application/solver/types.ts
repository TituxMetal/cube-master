import type { MoveToken } from '~/domain'

export type MoveGroup = {
  moves: MoveToken[]
}

export type SolvePhase = {
  name: string
  groups: MoveGroup[]
}

export type Solution = {
  phases: SolvePhase[]
  totalMoves: number
}
