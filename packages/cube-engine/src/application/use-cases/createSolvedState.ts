import { Color } from '~/domain/constants'
import { makeSolvedCornerPiece, makeSolvedEdgePiece } from '~/domain/pieces'
import type { CubeState } from '~/domain/state'

export const createSolvedState = (): CubeState => {
  const corners = {
    UFR: makeSolvedCornerPiece('UFR', [Color.White, Color.Green, Color.Red]),
    ULF: makeSolvedCornerPiece('ULF', [Color.White, Color.Orange, Color.Green]),
    URB: makeSolvedCornerPiece('URB', [Color.White, Color.Red, Color.Blue]),
    UBL: makeSolvedCornerPiece('UBL', [Color.White, Color.Blue, Color.Orange]),
    DFR: makeSolvedCornerPiece('DFR', [Color.Yellow, Color.Green, Color.Red]),
    DLF: makeSolvedCornerPiece('DLF', [Color.Yellow, Color.Orange, Color.Green]),
    DRB: makeSolvedCornerPiece('DRB', [Color.Yellow, Color.Red, Color.Blue]),
    DBL: makeSolvedCornerPiece('DBL', [Color.Yellow, Color.Blue, Color.Orange])
  }
  const edges = {
    UF: makeSolvedEdgePiece('UF', [Color.White, Color.Green]),
    UR: makeSolvedEdgePiece('UR', [Color.White, Color.Red]),
    UB: makeSolvedEdgePiece('UB', [Color.White, Color.Blue]),
    UL: makeSolvedEdgePiece('UL', [Color.White, Color.Orange]),
    DF: makeSolvedEdgePiece('DF', [Color.Yellow, Color.Green]),
    DR: makeSolvedEdgePiece('DR', [Color.Yellow, Color.Red]),
    DB: makeSolvedEdgePiece('DB', [Color.Yellow, Color.Blue]),
    DL: makeSolvedEdgePiece('DL', [Color.Yellow, Color.Orange]),
    FR: makeSolvedEdgePiece('FR', [Color.Green, Color.Red]),
    FL: makeSolvedEdgePiece('FL', [Color.Green, Color.Orange]),
    BR: makeSolvedEdgePiece('BR', [Color.Blue, Color.Red]),
    BL: makeSolvedEdgePiece('BL', [Color.Blue, Color.Orange])
  }
  const centers = {
    U: Color.White,
    F: Color.Green,
    R: Color.Red,
    B: Color.Blue,
    L: Color.Orange,
    D: Color.Yellow
  }

  return { corners, edges, centers }
}
