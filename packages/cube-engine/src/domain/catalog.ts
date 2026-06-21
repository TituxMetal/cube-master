import type { MoveToken } from './moves'

// The catalog holds the canonical form of each named algorithm (ADR-0006).
// Consumers: the five solver phases (where consumed) and Coach. Positional
// variants inside solver phases (per-target inserts, extraction tables) stay
// local — they are solver mechanics, not named teachable algorithms.
export type AlgorithmMethod = 'beginner' | 'intermediate' | 'advanced'

export type AlgorithmEntry = {
  readonly id: string
  readonly name: string
  readonly moves: readonly MoveToken[]
  readonly method: AlgorithmMethod
  readonly description: string
}

export const ALGORITHM_CATALOG: readonly AlgorithmEntry[] = [
  {
    id: 'sexy-move',
    name: 'Sexy Move',
    moves: ["R'", "D'", 'R', 'D'],
    method: 'beginner',
    description: 'The foundational R′ D′ R D trigger — repeated to lift white corners home.'
  },
  {
    id: 'sexy-move-mirror',
    name: 'Sexy Move (Mirror)',
    moves: ['L', 'D', "L'", "D'"],
    method: 'beginner',
    description:
      'The left-hand mirror of the sexy move — a second front working position (front-left) so the Coach teaching solver reaches every white corner with U/D placement and no cube rotation.'
  },
  {
    id: 'second-layer-insert-right',
    name: 'Second Layer Insert (Right)',
    moves: ["D'", "R'", 'D', 'R', 'D', 'F', "D'", "F'"],
    method: 'beginner',
    description: 'Send a bottom edge up into the right-hand middle-layer slot.'
  },
  {
    id: 'second-layer-insert-left',
    name: 'Second Layer Insert (Left)',
    moves: ['D', 'F', "D'", "F'", "D'", "R'", 'D', 'R'],
    method: 'beginner',
    description: 'Send a bottom edge up into the left-hand middle-layer slot.'
  },
  {
    id: 'second-layer-insert-front-left',
    name: 'Second Layer Insert (Front-Left)',
    moves: ['D', 'L', "D'", "L'", "D'", "F'", 'D', 'F'],
    method: 'beginner',
    description:
      'Send a bottom edge up into the front-left middle-layer slot — the mirror of the right insert.'
  },
  {
    id: 'second-layer-insert-back-right',
    name: 'Second Layer Insert (Back-Right)',
    moves: ['D', 'R', "D'", "R'", "D'", "B'", 'D', 'B'],
    method: 'beginner',
    description:
      'Send a bottom edge up into the back-right middle-layer slot, using the back face — no cube rotation.'
  },
  {
    id: 'second-layer-insert-back-left',
    name: 'Second Layer Insert (Back-Left)',
    moves: ["D'", "L'", 'D', 'L', 'D', 'B', "D'", "B'"],
    method: 'beginner',
    description:
      'Send a bottom edge up into the back-left middle-layer slot, using the back face — no cube rotation.'
  },
  {
    id: 'yellow-cross-line',
    name: 'Yellow Cross (Line)',
    moves: ["F'", "R'", "D'", 'R', 'D', 'F'],
    method: 'beginner',
    description: 'Turn a yellow line into the full yellow cross.'
  },
  {
    id: 'yellow-cross-l',
    name: 'Yellow Cross (L-shape)',
    moves: ['R', 'D', 'F', "D'", "F'", "R'"],
    method: 'beginner',
    description: 'Turn a yellow L-shape into the full yellow cross.'
  },
  {
    id: 'sune',
    name: 'Sune',
    moves: ['R', 'D', "R'", 'D', 'R', 'D2', "R'"],
    method: 'beginner',
    description: 'Orient the last-layer corners when one corner already points up.'
  },
  {
    id: 'anti-sune',
    name: 'Anti-Sune',
    moves: ['R', 'D2', "R'", "D'", 'R', "D'", "R'"],
    method: 'beginner',
    description: 'The mirror of Sune — orients the last-layer corners the other way.'
  },
  {
    id: 'corner-3-cycle',
    name: 'Corner 3-Cycle',
    moves: ['D', 'R', "D'", "L'", 'D', "R'", "D'", 'L'],
    method: 'beginner',
    description: 'Cycle three last-layer corners into their home positions.'
  },
  {
    id: 'a-perm',
    name: 'Corner Cycle (orientation-safe)',
    moves: ['R', "F'", 'R', 'B2', "R'", 'F', 'R', 'B2', 'R2'],
    method: 'beginner',
    description:
      'Cycle three last-layer corners into their homes WITHOUT twisting them — the yellow stays on the bottom face throughout (an A-perm). The Coach uses this, not corner-3-cycle, to place already-oriented corners so the finished yellow face is never disturbed.'
  },
  {
    id: 'white-cross-flip',
    name: 'White Cross Flip',
    moves: ['D', 'R', "F'", "R'"],
    method: 'beginner',
    description: 'Flip a misoriented white edge into the cross with white on top.'
  },
  {
    id: 'ua-perm',
    name: 'Ua Perm',
    moves: ['R', 'D', "R'", 'D', 'R', 'D2', "R'", 'D'],
    method: 'beginner',
    description: 'Cycle the last three top-layer edges into place to finish the cube.'
  },
  {
    id: 'edge-3-cycle',
    name: 'Edge 3-Cycle',
    moves: ['R', "D'", 'R', 'D', 'R', 'D', 'R', "D'", "R'", "D'", 'R2'],
    method: 'beginner',
    description:
      'Cycle three last-layer edges into place while leaving the corners untouched — the corner-safe finishing move the Coach teaching solver uses for the last edges (the catalog ua-perm disturbs corners, so it cannot end a staged solve).'
  }
]

export const getAlgorithm = (id: string): AlgorithmEntry | undefined =>
  ALGORITHM_CATALOG.find(entry => entry.id === id)
