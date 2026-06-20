import type { Lesson, TeachingScenario } from './types'

// Chapitre 3 — Le deuxième étage. Fills the middle layer with TWO gestures, the
// right insert and the left insert, each carried to the slot where the edge belongs
// (front and back). Teaching demos play real groups of the plan; the full-chapter
// practice fills the whole middle layer from the first-layer milestone.

// The middle band of the four side faces — the four edges of the middle layer.
const MIDDLE_BAND = { F: [3, 5], R: [3, 5], B: [3, 5], L: [3, 5] }

const SCENARIO: TeachingScenario = {
  phase: 'second-layer',
  from: 'white-corners',
  to: 'second-layer'
}

export const secondLayer: Lesson = {
  id: 'second-layer',
  title: 'Le deuxième étage',
  method: 'beginner',
  order: 3,
  steps: [
    {
      kind: 'understand',
      title: 'L’étage du milieu',
      body: 'Le premier étage est fini. On remplit maintenant l’étage du milieu : ses quatre arêtes, une par côté, surlignées sur l’image. Chacune a deux couleurs et aucune n’est jaune (le jaune, c’est pour le dernier étage). Tout ce chapitre tient en deux gestes : un insert vers la droite, un insert vers la gauche.',
      visual: { state: 'second-layer', highlight: MIDDLE_BAND }
    },
    {
      kind: 'understand',
      title: 'Repérer l’arête à descendre',
      body: 'Cherche dans l’étage du bas une arête sans jaune : c’est une arête du milieu qui attend. Sa couleur de face te dit où elle va. Tourne le bas pour que cette couleur de face tombe pile sur le centre de la même couleur ; tu vois alors si sa maison est à droite ou à gauche de là.',
      visual: { state: { caseOf: 'second-layer-insert-right', goal: 'second-layer' } }
    },
    {
      kind: 'demo',
      title: 'L’insert vers la droite',
      body: 'Quand la maison est à droite, c’est l’insert droit. Ici la fente tenait déjà une mauvaise arête : le même insert la fait ressortir en bas, on réaligne, et on recommence pour la bonne. La face blanche en haut n’est jamais abîmée.',
      scenario: SCENARIO,
      groupIndex: 1
    },
    {
      kind: 'understand',
      title: 'Le même geste, en miroir',
      body: 'Quand la maison est à gauche, c’est exactement le même geste vu dans le miroir : là où la droite part avec R, la gauche part avec F. Si tu sais faire l’un, tu sais déjà l’autre.',
      visual: { state: { caseOf: 'second-layer-insert-left', goal: 'second-layer' } }
    },
    {
      kind: 'demo',
      title: 'L’insert vers la gauche',
      body: 'Aligne l’arête sous son centre, puis déroule l’insert gauche. Tu reconnais le miroir du précédent : l’arête se glisse dans sa fente et l’étage du milieu se referme.',
      scenario: SCENARIO,
      groupIndex: 3
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : tout l’étage du milieu',
      body: 'Pars du premier étage fini et place les quatre arêtes toi-même. Pour chacune : repère une arête sans jaune en bas, aligne sa couleur de face sur le bon centre, puis déroule l’insert du côté de sa maison. La pastille indique le prochain coup. C’est gagné quand les deux premiers étages sont pleins.',
      scenario: SCENARIO
    }
  ]
}
