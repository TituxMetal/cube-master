import type { Lesson, TeachingScenario } from './types'

// Chapitre 7 — Finir. The last step: cycle the final three last-layer edges into
// place with the corner-safe edge 3-cycle, and the cube is solved. A single gesture,
// so one demo (a clean isolated case, so it is not a replay of the practice) plus the
// full-chapter practice from the last milestone to the solved cube.

// The four edges of the bottom (yellow) face.
const D_EDGES = { D: [1, 3, 5, 7] }

const SCENARIO: TeachingScenario = {
  phase: 'permute-edges',
  from: 'yellow-corners-placed',
  to: 'solved'
}

export const finish: Lesson = {
  id: 'finish',
  title: 'Finir',
  method: 'beginner',
  order: 7,
  steps: [
    {
      kind: 'understand',
      title: 'La dernière ligne droite',
      body: 'Tout est en place sauf les dernières arêtes du dessous : elles sont jaunes, mais deux ou trois doivent encore échanger leur place pour aligner leurs couleurs de côté. Un seul geste les fait tourner entre elles sans toucher aux coins déjà rangés, et le cube est résolu. Tu y es presque.',
      visual: { state: { caseOf: 'edge-3-cycle' }, highlight: D_EDGES }
    },
    {
      kind: 'demo',
      title: 'Le dernier échange',
      body: 'Cherche l’arête déjà bien placée et garde-la à l’arrière, puis déroule le geste : les trois autres tournent jusqu’à retomber chez elles. Regarde le cube se refermer complètement.',
      algorithmId: 'edge-3-cycle',
      demoFrom: 'case',
      goal: 'solved'
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : termine le cube',
      body: 'Le dernier effort : aligne le bas pour garder l’arête correcte à l’arrière, puis déroule le geste — une fois, parfois deux. La pastille indique le prochain coup. Quand la toute dernière pièce tombe en place et que le cube est résolu : bravo, tu l’as fait toi-même, du début à la fin.',
      scenario: SCENARIO
    }
  ]
}
