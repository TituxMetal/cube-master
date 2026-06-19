import type { Lesson } from './types'

// Chapitre 7 — Finir. The last step: cycle the final three last-layer edges into
// place with the Ua perm (promoted per D-CATALOG-FINISH), and the cube is solved.
// Goal is genuinely 'solved' here — this is the real finish.
// The four edges of the bottom (yellow) face.
const D_EDGES = { D: [1, 3, 5, 7] }

export const finish: Lesson = {
  id: 'finish',
  title: 'Finir',
  method: 'beginner',
  order: 7,
  steps: [
    {
      kind: 'understand',
      title: 'La dernière ligne droite',
      body: 'Tout est en place sauf les dernières arêtes du dessous : elles sont jaunes, mais deux ou trois doivent encore permuter. Un dernier geste les remet dans l’ordre, et le cube est résolu. Tu y es presque.',
      visual: { state: { caseOf: 'ua-perm' }, highlight: D_EDGES }
    },
    {
      kind: 'demo',
      title: 'Le dernier échange',
      body: 'Garde l’arête déjà bien placée à l’arrière et déroule la séquence : les trois autres arêtes tournent jusqu’à retomber chez elles. Regarde le cube se refermer complètement.',
      algorithmId: 'ua-perm',
      demoFrom: 'case',
      goal: 'solved'
    },
    {
      kind: 'practice',
      title: 'Termine le cube',
      body: 'Le dernier effort : les arêtes du dessous doivent permuter. Déroule la séquence et regarde la toute dernière pièce se mettre en place. Quand le cube est résolu — bravo, tu l’as fait toi-même, du début à la fin.',
      algorithmId: 'ua-perm',
      goal: 'solved'
    }
  ]
}
