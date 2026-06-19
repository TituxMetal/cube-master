import type { Lesson } from './types'

// Chapitre 3 — Le deuxième étage. Fills the middle layer with the two mirrored
// inserts (right + left). Demos + practice anchor on the second-layer milestone
// (first two layers done, the last layer still mixed).
// The middle band of the four side faces — the four edges of the middle layer.
const MIDDLE_BAND = {
  F: [3, 5],
  R: [3, 5],
  B: [3, 5],
  L: [3, 5]
}

export const secondLayer: Lesson = {
  id: 'second-layer',
  title: 'Le deuxième étage',
  method: 'beginner',
  order: 3,
  steps: [
    {
      kind: 'understand',
      title: "L'étage du milieu",
      body: 'Beau travail : la face blanche est finie. On remplit maintenant le deuxième étage — les quatre arêtes entre le haut et le bas. Tu as déjà tout ce qu’il faut ; ce chapitre, ce sont deux mouvements en miroir. Voici le but : les deux premiers étages complets.',
      visual: { state: 'second-layer', highlight: MIDDLE_BAND }
    },
    {
      kind: 'demo',
      title: 'Envoyer une arête à droite',
      body: 'Quand une arête doit descendre dans la fente de droite, on l’aligne d’abord sous son centre, puis on déroule cette séquence. Regarde-la se glisser à sa place sans abîmer la face blanche déjà faite.',
      algorithmId: 'second-layer-insert-right',
      demoFrom: 'case',
      goal: 'second-layer'
    },
    {
      kind: 'understand',
      title: 'Le miroir, à gauche',
      body: 'La fente de gauche, c’est exactement pareil, en miroir : là où la droite part avec R, la gauche part avec F. Si tu sais faire l’une, tu sais déjà l’autre — c’est le même geste vu dans le miroir.',
      visual: { state: { caseOf: 'second-layer-insert-left', goal: 'second-layer' } }
    },
    {
      kind: 'demo',
      title: 'Envoyer une arête à gauche',
      body: 'Même idée, inversée. Aligne l’arête sous son centre et déroule l’insert gauche. Tu reconnais le miroir du précédent.',
      algorithmId: 'second-layer-insert-left',
      demoFrom: 'case',
      goal: 'second-layer'
    },
    {
      kind: 'practice',
      title: "Insère l'arête",
      body: 'À toi : une arête attend en bas, alignée sous sa fente de droite. Déroule l’insert droit et regarde le deuxième étage se compléter.',
      algorithmId: 'second-layer-insert-right',
      goal: 'second-layer'
    }
  ]
}
