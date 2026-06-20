import type { ColorCode, CornerPositionId, CubeState, MoveToken } from '~/domain'
import { getAlgorithm } from '~/domain'
import { applyMove } from '~/domain/moves/apply'

import { findCornerByColors, invertUTurns, isCornerHome } from './helpers'
import type { TeachingPlan, TeachingSegment, TeachingStepGroup } from './types'

// planWhiteCorners (Ch2) — the proof-slice planner. Turns a white-cross state into
// a `recognize → place → trigger` sequence with NO cube rotation: intuitive U/D
// placement plus one of two front triggers (the sexy move on the right, its mirror
// on the left). Proven feasible over random scrambles by spike TS-0
// (docs/solutions/2026-06-20-coach-no-rotation-teaching-solver-feasibility.md).
//
// Geometry the planner leans on (all verified in TS-0): a trigger preserves the
// entire white cross every application (it never touches UF/UB/UL and returns the
// one side edge it does touch), and it disturbs only the working slot's back
// neighbour among U-corners. So `U-setup → trigger-until-seated → U-undo` restores
// every already-placed piece, as long as that back neighbour holds no solved corner
// — which the planner sidesteps by trying the right trigger, then the left mirror,
// and committing the first option that makes progress with the cross intact.

const U_CORNERS: readonly CornerPositionId[] = ['UFR', 'URB', 'UBL', 'ULF']
const U_EDGES = ['UF', 'UR', 'UB', 'UL'] as const

// Two front working slots. `triggerId` names the catalog block (canonical source,
// ADR-0006) so the trigger segment carries it for parity-pinning + UI naming.
type WorkingSlot = {
  readonly home: CornerPositionId
  readonly dPos: CornerPositionId
  readonly triggerId: string
}
const RIGHT: WorkingSlot = { home: 'UFR', dPos: 'DFR', triggerId: 'sexy-move' }
const LEFT: WorkingSlot = { home: 'ULF', dPos: 'DLF', triggerId: 'sexy-move-mirror' }

// Try the working slot nearest the corner's home first: a front-left corner is
// taught with the left mirror, a front-/back-right corner with the right sexy move.
// This exercises both triggers (the pedagogy) and keeps U-setup minimal; the other
// slot stays as a correctness fallback. (D-GESTURE)
const LEFT_HOMES = new Set<CornerPositionId>(['ULF', 'UBL'])
const slotsFor = (target: CornerPositionId): readonly WorkingSlot[] =>
  LEFT_HOMES.has(target) ? [LEFT, RIGHT] : [RIGHT, LEFT]

const triggerMoves = (id: string): readonly MoveToken[] => getAlgorithm(id)?.moves ?? []

// Clockwise U-cycle of the four top corners — a U turn sends each home one step on.
const U_ORDER: readonly CornerPositionId[] = ['UFR', 'ULF', 'UBL', 'URB']
const D_ORDER: readonly CornerPositionId[] = ['DFR', 'DRB', 'DBL', 'DLF']

const ringTurn = (
  order: readonly CornerPositionId[],
  face: 'U' | 'D',
  from: CornerPositionId,
  to: CornerPositionId
): MoveToken[] => {
  const steps = (order.indexOf(to) - order.indexOf(from) + 4) % 4
  if (steps === 0) return []
  if (steps === 1) return [face]
  if (steps === 2) return [`${face}2` as MoveToken]
  return [`${face}'` as MoveToken]
}
const uSetupTo = (from: CornerPositionId, to: CornerPositionId): MoveToken[] =>
  ringTurn(U_ORDER, 'U', from, to)
const dSetupTo = (from: CornerPositionId, to: CornerPositionId): MoveToken[] =>
  ringTurn(D_ORDER, 'D', from, to)

const applySeq = (state: CubeState, moves: readonly MoveToken[]): CubeState => {
  let s = state
  for (const m of moves) s = applyMove(s, m)
  return s
}

const cornerColors = (
  solved: CubeState,
  pos: CornerPositionId
): [ColorCode, ColorCode, ColorCode] =>
  [...solved.corners[pos].colors] as [ColorCode, ColorCode, ColorCode]

const crossIntact = (s: CubeState): boolean =>
  U_EDGES.every(p => s.edges[p].id === p && s.edges[p].orientation === 0)
const countSolved = (s: CubeState): number => U_CORNERS.filter(p => isCornerHome(s, p)).length
const allSolved = (s: CubeState): boolean => countSolved(s) === 4

// One place-then-trigger attempt at a working slot. Returns the segments + the
// resulting state, or null if it can't seat the piece there.
type Attempt = { segments: TeachingSegment[]; state: CubeState }

const attemptInsert = (
  state: CubeState,
  colors: readonly [ColorCode, ColorCode, ColorCode],
  target: CornerPositionId,
  slot: WorkingSlot
): Attempt | null => {
  const setupU = uSetupTo(target, slot.home)
  let s = applySeq(state, setupU)
  const piecePos = findCornerByColors(s, colors)
  if (piecePos[0] !== 'D') return null
  const setupD = dSetupTo(piecePos, slot.dPos)
  s = applySeq(s, setupD)

  const trigger = triggerMoves(slot.triggerId)
  const triggerRun: MoveToken[] = []
  let seated = false
  for (let i = 0; i < 6; i++) {
    if (findCornerByColors(s, colors) === slot.home && s.corners[slot.home].orientation === 0) {
      seated = true
      break
    }
    triggerRun.push(...trigger)
    s = applySeq(s, trigger)
  }
  if (!seated) return null

  const restoreU = invertUTurns(setupU)
  s = applySeq(s, restoreU)

  const placement = [...setupU, ...setupD]
  const segments: TeachingSegment[] = []
  if (placement.length > 0) segments.push({ kind: 'setup', moves: placement })
  segments.push({ kind: 'trigger', moves: triggerRun, catalogId: slot.triggerId })
  if (restoreU.length > 0) segments.push({ kind: 'setup', moves: restoreU })
  return { segments, state: s }
}

// Extract a white corner stuck in the U layer (wrong slot/orientation) down to D,
// so a later insert can place it. One trigger pops it out; cross stays intact.
const attemptExtract = (
  state: CubeState,
  colors: readonly [ColorCode, ColorCode, ColorCode],
  slot: WorkingSlot
): Attempt | null => {
  const piecePos = findCornerByColors(state, colors)
  if (piecePos[0] !== 'U') return null
  const setupU = uSetupTo(piecePos, slot.home)
  let s = applySeq(state, setupU)
  const trigger = triggerMoves(slot.triggerId)
  s = applySeq(s, trigger)
  const restoreU = invertUTurns(setupU)
  s = applySeq(s, restoreU)
  if (findCornerByColors(s, colors)[0] !== 'D') return null

  const segments: TeachingSegment[] = []
  if (setupU.length > 0) segments.push({ kind: 'setup', moves: setupU })
  segments.push({ kind: 'trigger', moves: [...trigger], catalogId: slot.triggerId })
  if (restoreU.length > 0) segments.push({ kind: 'setup', moves: restoreU })
  return { segments, state: s }
}

export const planWhiteCorners = (state: CubeState, solved: CubeState): TeachingPlan => {
  let cur = state
  const groups: TeachingStepGroup[] = []

  for (let iter = 0; iter < 40 && !allSolved(cur); iter++) {
    const before = countSolved(cur)
    let progressed = false

    // Phase A — insert a corner whose piece is already in the D layer.
    for (const target of U_CORNERS) {
      if (isCornerHome(cur, target)) continue
      const colors = cornerColors(solved, target)
      if (findCornerByColors(cur, colors)[0] !== 'D') continue
      for (const slot of slotsFor(target)) {
        const attempt = attemptInsert(cur, colors, target, slot)
        if (attempt && countSolved(attempt.state) > before && crossIntact(attempt.state)) {
          groups.push({ segments: attempt.segments })
          cur = attempt.state
          progressed = true
          break
        }
      }
      if (progressed) break
    }
    if (progressed) continue

    // Phase B — no D-layer insert available: extract a stuck U-layer corner.
    for (const target of U_CORNERS) {
      if (isCornerHome(cur, target)) continue
      const colors = cornerColors(solved, target)
      if (findCornerByColors(cur, colors)[0] !== 'U') continue
      for (const slot of slotsFor(target)) {
        const attempt = attemptExtract(cur, colors, slot)
        if (attempt && countSolved(attempt.state) >= before && crossIntact(attempt.state)) {
          groups.push({ segments: attempt.segments })
          cur = attempt.state
          progressed = true
          break
        }
      }
      if (progressed) break
    }
    if (!progressed) break
  }

  return { groups }
}
