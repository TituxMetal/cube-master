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
  }
]

export const getAlgorithm = (id: string): AlgorithmEntry | undefined =>
  ALGORITHM_CATALOG.find(entry => entry.id === id)
