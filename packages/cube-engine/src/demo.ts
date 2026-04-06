/**
 * Solver demo — benchmark and visual verification.
 * Run with: bun run --cwd packages/cube-engine demo
 */

import type { CubeState, MoveToken } from '~/domain'
import { toStickers } from '~/infrastructure/render/toStickers'

import type { Solution } from './application/solver/types'
import { applyMoves } from './application/use-cases/applyMoves'
import { createSolvedState } from './application/use-cases/createSolvedState'
import { generateScramble } from './application/use-cases/generateScramble'
import { solveCube } from './application/use-cases/solveCube'

// ─── Helpers ────────────────────────────────────────────────

const isSolved = (state: CubeState): boolean => {
  const s = toStickers(state)
  const ref = toStickers(createSolvedState())
  return (['U', 'D', 'F', 'B', 'L', 'R'] as const).every(f => s[f].every((c, i) => c === ref[f][i]))
}

const pad = (str: string, len: number) => str.padEnd(len)
const rpad = (str: string, len: number) => str.padStart(len)

const printHeader = (title: string) => {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  ${title}`)
  console.log('═'.repeat(60))
}

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`

const printSolve = (
  label: string,
  scramble: MoveToken[],
  solution: Solution,
  time: number,
  ok: boolean
) => {
  const status = ok ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
  console.log(
    `  ${pad(label, 32)} ${rpad(String(solution.totalMoves), 4)} moves  ${rpad(time.toFixed(1), 7)}ms  ${status}`
  )
  console.log(dim(`    Scramble: ${scramble.join(' ')}`))
  const phases = solution.phases
    .filter(p => p.groups.flatMap(g => g.moves).length > 0)
    .map(p => `${p.name}(${p.groups.flatMap(g => g.moves).length})`)
    .join(' → ')
  if (phases) console.log(dim(`    Phases:   ${phases}`))
}

// ─── 1. Random scrambles benchmark ──────────────────────────

const runRandomBenchmark = (count: number) => {
  printHeader(`Random Scrambles (${count} solves)`)

  const times: number[] = []
  const moveCounts: number[] = []
  let failures = 0

  for (let i = 0; i < count; i++) {
    const scramble = generateScramble(20)
    const scrambled = applyMoves(createSolvedState(), scramble)

    const t0 = performance.now()
    const solution = solveCube(scrambled)
    const elapsed = performance.now() - t0

    const result = applyMoves(
      scrambled,
      solution.phases.flatMap(p => p.groups.flatMap(g => g.moves))
    )
    const ok = isSolved(result)

    if (!ok) failures++
    times.push(elapsed)
    moveCounts.push(solution.totalMoves)

    printSolve(`Scramble #${i + 1}`, scramble, solution, elapsed, ok)
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  const maxTime = Math.max(...times)
  const avgMoves = moveCounts.reduce((a, b) => a + b, 0) / moveCounts.length

  console.log('  ─'.repeat(20))
  console.log(`  Average: ${avgMoves.toFixed(0)} moves, ${avgTime.toFixed(1)}ms`)
  console.log(`  Max time: ${maxTime.toFixed(1)}ms`)
  console.log(
    `  Result: ${failures === 0 ? '\x1b[32mALL PASS\x1b[0m' : `\x1b[31m${failures} FAILURES\x1b[0m`}`
  )
}

// ─── 2. Fixed scrambles (reproducible) ──────────────────────

const runFixedScrambles = () => {
  printHeader('Fixed Scrambles (reproducible)')

  const cases: { name: string; scramble: MoveToken[] }[] = [
    { name: 'Simple (3 moves)', scramble: ['D', 'R', "F'"] },
    {
      name: 'Medium (10 moves)',
      scramble: ['R', "U'", 'F2', 'D', "L'", 'B', 'R2', "U'", 'F', 'D']
    },
    {
      name: 'Full (20 moves)',
      scramble: [
        'R',
        'U',
        "F'",
        'D2',
        'L',
        "B'",
        'R2',
        'U',
        'D',
        "L'",
        'F',
        'B',
        "R'",
        'U2',
        'D',
        'F2',
        "B'",
        'L',
        "R'",
        'U'
      ]
    },
    {
      name: 'Double moves',
      scramble: ['R2', 'U2', 'F2', 'D2', 'L2', 'B2']
    }
  ]

  for (const { name, scramble } of cases) {
    const scrambled = applyMoves(createSolvedState(), scramble)
    const t0 = performance.now()
    const solution = solveCube(scrambled)
    const elapsed = performance.now() - t0
    const result = applyMoves(
      scrambled,
      solution.phases.flatMap(p => p.groups.flatMap(g => g.moves))
    )
    printSolve(name, scramble, solution, elapsed, isSolved(result))
  }
}

// ─── 3. Single-algorithm scenarios ──────────────────────────

const runAlgorithmScenarios = () => {
  printHeader('Single-Algorithm Scenarios')

  const scenarios: { name: string; setup: MoveToken[] }[] = [
    // Sexy move applied 6x = identity, so 1-5x need solving
    {
      name: 'Sexy move x1',
      setup: ["R'", "D'", 'R', 'D']
    },
    {
      name: 'Sexy move x3',
      setup: ["R'", "D'", 'R', 'D', "R'", "D'", 'R', 'D', "R'", "D'", 'R', 'D']
    },
    // Sune (OLL/PLL algorithm)
    {
      name: 'Sune x1',
      setup: ['R', 'D', "R'", 'D', 'R', 'D2', "R'"]
    },
    {
      name: 'Sune x2',
      setup: ['R', 'D', "R'", 'D', 'R', 'D2', "R'", 'R', 'D', "R'", 'D', 'R', 'D2', "R'"]
    },
    // T-perm style (corner 3-cycle)
    {
      name: 'Corner 3-cycle',
      setup: ['D', 'R', "D'", "L'", 'D', "R'", "D'", 'L']
    },
    // Just D-layer moves
    { name: 'D layer only', setup: ['D', 'D2', "D'", 'D'] },
    // Single face
    { name: 'Single R', setup: ['R'] },
    { name: 'Single F', setup: ['F'] }
  ]

  for (const { name, setup } of scenarios) {
    const scrambled = applyMoves(createSolvedState(), setup)
    const t0 = performance.now()
    const solution = solveCube(scrambled)
    const elapsed = performance.now() - t0
    const result = applyMoves(
      scrambled,
      solution.phases.flatMap(p => p.groups.flatMap(g => g.moves))
    )
    printSolve(name, setup, solution, elapsed, isSolved(result))
  }
}

// ─── 4. Phase breakdown for one scramble ────────────────────

const runPhaseBreakdown = () => {
  printHeader('Phase Breakdown (20-move scramble)')

  const scramble: MoveToken[] = [
    'R',
    'U',
    "F'",
    'D2',
    'L',
    "B'",
    'R2',
    'U',
    'D',
    "L'",
    'F',
    'B',
    "R'",
    'U2',
    'D',
    'F2',
    "B'",
    'L',
    "R'",
    'U'
  ]
  const scrambled = applyMoves(createSolvedState(), scramble)
  const solution = solveCube(scrambled)

  for (const phase of solution.phases) {
    console.log(
      `  ${pad(phase.name, 20)} ${rpad(String(phase.groups.flatMap(g => g.moves).length), 4)} moves`
    )
  }
  console.log('  ─'.repeat(20))
  console.log(`  ${pad('Total', 20)} ${rpad(String(solution.totalMoves), 4)} moves`)
}

// ─── Run all ────────────────────────────────────────────────

console.log('\x1b[1mCubeMaster Solver Demo\x1b[0m')

runFixedScrambles()
runAlgorithmScenarios()
runPhaseBreakdown()
runRandomBenchmark(10)

console.log('')
