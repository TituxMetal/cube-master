import type { Lesson } from './types'

// Chapitre 7 — Finir. Cycle the last three last-layer edges into place with the
// corner-safe edge 3-cycle, and the cube is solved. The demo runs the gesture on its
// clean canonical case: ONE edge is already home, at the FRONT (D[1]), and the cycle
// turns the other three home without touching the corners.

// The already-placed reference edge, kept at the front.
const EDGE_REF = { D: [1] }

export const finish: Lesson = {
  id: 'finish',
  title: 'Finir',
  method: 'beginner',
  order: 7,
  steps: [
    {
      kind: 'understand',
      title: 'La dernière ligne droite',
      body: 'Tout est en place sauf les dernières arêtes du dessous : elles sont jaunes, mais deux ou trois doivent encore échanger leur place pour aligner leurs couleurs de côté. Une est déjà bien placée — garde-la devant, surlignée sur l’image. Un seul geste fait tourner les trois autres entre elles, sans toucher aux coins déjà rangés, et le cube est résolu. Tu y es presque.',
      visual: { state: { caseOf: 'edge-3-cycle' }, highlight: EDGE_REF }
    },
    {
      kind: 'demo',
      title: 'Le dernier échange',
      body: 'L’arête déjà bonne devant, déroule le geste : les trois autres tournent jusqu’à retomber chez elles. Regarde le cube se refermer complètement.',
      algorithmId: 'edge-3-cycle',
      demoFrom: 'case',
      goal: 'solved'
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : termine le cube',
      body: 'Le dernier effort : tourne le bas pour garder l’arête déjà correcte devant, puis déroule le geste — une fois, parfois deux. La pastille indique le prochain coup. Quand la toute dernière pièce tombe en place et que le cube est résolu : bravo, tu l’as fait toi-même, du début à la fin.',
      scenario: { phase: 'permute-edges', from: 'yellow-corners-placed', to: 'solved' }
    }
  ]
}
