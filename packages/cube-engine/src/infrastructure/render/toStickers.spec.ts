import { describe, it, expect } from 'bun:test'

import { createSolvedState } from '~/application/use-cases/createSolvedState'
import { Color } from '~/domain/constants'
import { applyMove } from '~/domain/moves/apply'

import { toStickers } from './toStickers'

describe('Cube Infrastructure - toStickers', () => {
  it('should return 6 faces with 9 stickers each', () => {
    const state = createSolvedState()
    const stickers = toStickers(state)

    expect(stickers.U).toHaveLength(9)
    expect(stickers.D).toHaveLength(9)
    expect(stickers.F).toHaveLength(9)
    expect(stickers.B).toHaveLength(9)
    expect(stickers.L).toHaveLength(9)
    expect(stickers.R).toHaveLength(9)
  })

  it('should have uniform colors on each face', () => {
    const state = createSolvedState()
    const stickers = toStickers(state)

    expect(new Set(stickers.U).size).toBe(1)
    expect(new Set(stickers.D).size).toBe(1)
    expect(new Set(stickers.F).size).toBe(1)
    expect(new Set(stickers.B).size).toBe(1)
    expect(new Set(stickers.L).size).toBe(1)
    expect(new Set(stickers.R).size).toBe(1)
  })

  it('should have correct center colors on each face', () => {
    const state = createSolvedState()
    const stickers = toStickers(state)

    expect(stickers.U[4]).toBe(Color.White)
    expect(stickers.D[4]).toBe(Color.Yellow)
    expect(stickers.F[4]).toBe(Color.Green)
    expect(stickers.B[4]).toBe(Color.Blue)
    expect(stickers.L[4]).toBe(Color.Orange)
    expect(stickers.R[4]).toBe(Color.Red)
  })

  describe('toStickers - up face', () => {
    it('should have correct stickers on the up face', () => {
      const state = createSolvedState()
      const stickers = toStickers(state)

      expect(stickers.U[0]).toBe(state.corners.UBL.colors[0])
      expect(stickers.U[1]).toBe(state.edges.UB.colors[0])
      expect(stickers.U[2]).toBe(state.corners.URB.colors[0])
      expect(stickers.U[3]).toBe(state.edges.UL.colors[0])
      expect(stickers.U[4]).toBe(state.centers.U)
      expect(stickers.U[5]).toBe(state.edges.UR.colors[0])
      expect(stickers.U[6]).toBe(state.corners.ULF.colors[0])
      expect(stickers.U[7]).toBe(state.edges.UF.colors[0])
      expect(stickers.U[8]).toBe(state.corners.UFR.colors[0])
    })
  })

  describe('toStickers - down face', () => {
    it('should have correct stickers on the down face', () => {
      const state = createSolvedState()
      const stickers = toStickers(state)

      expect(stickers.D[0]).toBe(state.corners.DLF.colors[0])
      expect(stickers.D[1]).toBe(state.edges.DF.colors[0])
      expect(stickers.D[2]).toBe(state.corners.DFR.colors[0])
      expect(stickers.D[3]).toBe(state.edges.DL.colors[0])
      expect(stickers.D[4]).toBe(state.centers.D)
      expect(stickers.D[5]).toBe(state.edges.DR.colors[0])
      expect(stickers.D[6]).toBe(state.corners.DBL.colors[0])
      expect(stickers.D[7]).toBe(state.edges.DB.colors[0])
      expect(stickers.D[8]).toBe(state.corners.DRB.colors[0])
    })
  })

  describe('toStickers - front face', () => {
    it('should have correct stickers on the front face', () => {
      const state = createSolvedState()
      const stickers = toStickers(state)

      expect(stickers.F[0]).toBe(state.corners.ULF.colors[2])
      expect(stickers.F[1]).toBe(state.edges.UF.colors[1])
      expect(stickers.F[2]).toBe(state.corners.UFR.colors[1])
      expect(stickers.F[3]).toBe(state.edges.FL.colors[0])
      expect(stickers.F[4]).toBe(state.centers.F)
      expect(stickers.F[5]).toBe(state.edges.FR.colors[0])
      expect(stickers.F[6]).toBe(state.corners.DLF.colors[2])
      expect(stickers.F[7]).toBe(state.edges.DF.colors[1])
      expect(stickers.F[8]).toBe(state.corners.DFR.colors[1])
    })
  })

  describe('toStickers - right face', () => {
    it('should have correct stickers on the right face', () => {
      const state = createSolvedState()
      const stickers = toStickers(state)

      expect(stickers.R[0]).toBe(state.corners.UFR.colors[2])
      expect(stickers.R[1]).toBe(state.edges.UR.colors[1])
      expect(stickers.R[2]).toBe(state.corners.URB.colors[1])
      expect(stickers.R[3]).toBe(state.edges.FR.colors[1])
      expect(stickers.R[4]).toBe(state.centers.R)
      expect(stickers.R[5]).toBe(state.edges.BR.colors[1])
      expect(stickers.R[6]).toBe(state.corners.DFR.colors[2])
      expect(stickers.R[7]).toBe(state.edges.DR.colors[1])
      expect(stickers.R[8]).toBe(state.corners.DRB.colors[1])
    })
  })

  describe('toStickers - left face', () => {
    it('should have correct stickers on the left face', () => {
      const state = createSolvedState()
      const stickers = toStickers(state)

      expect(stickers.L[0]).toBe(state.corners.UBL.colors[2])
      expect(stickers.L[1]).toBe(state.edges.UL.colors[1])
      expect(stickers.L[2]).toBe(state.corners.ULF.colors[1])
      expect(stickers.L[3]).toBe(state.edges.BL.colors[1])
      expect(stickers.L[4]).toBe(state.centers.L)
      expect(stickers.L[5]).toBe(state.edges.FL.colors[1])
      expect(stickers.L[6]).toBe(state.corners.DBL.colors[2])
      expect(stickers.L[7]).toBe(state.edges.DL.colors[1])
      expect(stickers.L[8]).toBe(state.corners.DLF.colors[1])
    })
  })

  describe('toStickers - back face', () => {
    it('should have correct stickers on the back face', () => {
      const state = createSolvedState()
      const stickers = toStickers(state)

      expect(stickers.B[0]).toBe(state.corners.URB.colors[2])
      expect(stickers.B[1]).toBe(state.edges.UB.colors[1])
      expect(stickers.B[2]).toBe(state.corners.UBL.colors[1])
      expect(stickers.B[3]).toBe(state.edges.BR.colors[0])
      expect(stickers.B[4]).toBe(state.centers.B)
      expect(stickers.B[5]).toBe(state.edges.BL.colors[0])
      expect(stickers.B[6]).toBe(state.corners.DBL.colors[1])
      expect(stickers.B[7]).toBe(state.edges.DB.colors[1])
      expect(stickers.B[8]).toBe(state.corners.DRB.colors[2])
    })
  })

  describe('toStickers - after moves (orientation handling)', () => {
    it('should show correct stickers after R move', () => {
      const state = applyMove(createSolvedState(), 'R')
      const stickers = toStickers(state)

      // R face stays all red (face rotates but stickers stay on R)
      expect(stickers.R[4]).toBe(Color.Red)

      // After R: F right column (green) → U right column
      expect(stickers.U[2]).toBe(Color.Green)
      expect(stickers.U[5]).toBe(Color.Green)
      expect(stickers.U[8]).toBe(Color.Green)

      // After R: U right column (white) → B left column (reversed in net)
      expect(stickers.B[0]).toBe(Color.White)
      expect(stickers.B[3]).toBe(Color.White)
      expect(stickers.B[6]).toBe(Color.White)

      // After R: B left column (blue) → D right column (reversed)
      expect(stickers.D[2]).toBe(Color.Blue)
      expect(stickers.D[5]).toBe(Color.Blue)
      expect(stickers.D[8]).toBe(Color.Blue)

      // After R: D right column (yellow) → F right column
      expect(stickers.F[2]).toBe(Color.Yellow)
      expect(stickers.F[5]).toBe(Color.Yellow)
      expect(stickers.F[8]).toBe(Color.Yellow)
    })

    it('should show correct stickers after F move', () => {
      const state = applyMove(createSolvedState(), 'F')
      const stickers = toStickers(state)

      // F face stays all green
      expect(stickers.F[4]).toBe(Color.Green)

      // After F: U bottom row (white) → R left column
      expect(stickers.R[0]).toBe(Color.White)
      expect(stickers.R[3]).toBe(Color.White)
      expect(stickers.R[6]).toBe(Color.White)

      // After F: L right column (orange) → U bottom row
      expect(stickers.U[6]).toBe(Color.Orange)
      expect(stickers.U[7]).toBe(Color.Orange)
      expect(stickers.U[8]).toBe(Color.Orange)
    })

    it('should show correct stickers after L move', () => {
      const state = applyMove(createSolvedState(), 'L')
      const stickers = toStickers(state)

      // L face stays all orange
      expect(stickers.L[4]).toBe(Color.Orange)

      // After L: B right column (blue) → U left column
      expect(stickers.U[0]).toBe(Color.Blue)
      expect(stickers.U[3]).toBe(Color.Blue)
      expect(stickers.U[6]).toBe(Color.Blue)

      // After L: U left column (white) → F left column
      expect(stickers.F[0]).toBe(Color.White)
      expect(stickers.F[3]).toBe(Color.White)
      expect(stickers.F[6]).toBe(Color.White)

      // After L: F left column (green) → D left column
      expect(stickers.D[0]).toBe(Color.Green)
      expect(stickers.D[3]).toBe(Color.Green)
      expect(stickers.D[6]).toBe(Color.Green)

      // After L: D left column (yellow) → B right column
      expect(stickers.B[2]).toBe(Color.Yellow)
      expect(stickers.B[5]).toBe(Color.Yellow)
      expect(stickers.B[8]).toBe(Color.Yellow)
    })

    it('should show correct stickers after B move', () => {
      const state = applyMove(createSolvedState(), 'B')
      const stickers = toStickers(state)

      // B face stays all blue
      expect(stickers.B[4]).toBe(Color.Blue)

      // After B: R right column (red) → U top row
      expect(stickers.U[0]).toBe(Color.Red)
      expect(stickers.U[1]).toBe(Color.Red)
      expect(stickers.U[2]).toBe(Color.Red)

      // After B: U top row (white) → L left column
      expect(stickers.L[0]).toBe(Color.White)
      expect(stickers.L[3]).toBe(Color.White)
      expect(stickers.L[6]).toBe(Color.White)

      // After B: L left column (orange) → D back row
      expect(stickers.D[6]).toBe(Color.Orange)
      expect(stickers.D[7]).toBe(Color.Orange)
      expect(stickers.D[8]).toBe(Color.Orange)

      // After B: D back row (yellow) → R right column
      expect(stickers.R[2]).toBe(Color.Yellow)
      expect(stickers.R[5]).toBe(Color.Yellow)
      expect(stickers.R[8]).toBe(Color.Yellow)
    })
  })
})
