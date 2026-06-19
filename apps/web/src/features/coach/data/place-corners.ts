import type { Lesson } from './types'

// Chapitre 6 — Placer les coins. Send the last-layer corners to their home
// positions with the corner 3-cycle. A last-layer step (first two layers + cross +
// orientation done), so the demo resolves to solved.
// The four corners of the bottom (yellow) face.
const D_CORNERS = { D: [0, 2, 6, 8] }

export const placeCorners: Lesson = {
  id: 'place-corners',
  title: 'Placer les coins',
  method: 'beginner',
  order: 6,
  steps: [
    {
      kind: 'understand',
      title: 'Chaque coin chez lui',
      body: 'Le dessous est tout jaune, mais certains coins ne sont pas au bon endroit : leurs couleurs de côté ne tombent pas en face des bonnes faces. On va échanger trois coins d’un coup pour les renvoyer chez eux, sans déranger le reste.',
      visual: { state: { caseOf: 'corner-3-cycle' }, highlight: D_CORNERS }
    },
    {
      kind: 'demo',
      title: 'Le cycle des coins',
      body: 'Cette séquence fait tourner trois coins entre eux. Repère le coin déjà bien placé, garde-le en haut à droite, et déroule : les trois autres glissent à leur place. Au besoin, répète une seconde fois.',
      algorithmId: 'corner-3-cycle',
      demoFrom: 'case',
      goal: 'solved'
    },
    {
      kind: 'practice',
      title: 'Renvoie les coins chez eux',
      body: 'À toi : les coins sont jaunes mais mal placés. Déroule le cycle des coins et regarde-les retrouver leur coin, couleurs de côté alignées.',
      algorithmId: 'corner-3-cycle',
      goal: 'solved'
    }
  ]
}
