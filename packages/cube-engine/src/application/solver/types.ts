import type { MoveToken } from '~/domain'

export type SolvePhase = {
  name: string
  moves: MoveToken[]
}

export type Solution = {
  phases: SolvePhase[]
  totalMoves: number
}
