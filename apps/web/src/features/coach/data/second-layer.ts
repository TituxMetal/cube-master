import type { Lesson, TeachingScenario } from './types'

// Chapitre 3 — Le deuxième étage. Fills the middle layer with one insert gesture and
// its mirror, taught on all FOUR slots: front-right / front-left (front face) and
// back-right / back-left (back face). Each slot has its own short catalog gesture
// (≤8 moves, top layer intact), so every gesture the full-chapter practice runs has a
// clean demo on its own recognisable case — front cases sit at DF, back cases at DB.

// The middle band — the four edges of the middle layer (the chapter goal).
const MIDDLE_BAND = { F: [3, 5], R: [3, 5], B: [3, 5], L: [3, 5] }
// The edge waiting in the bottom, front (DF) and back (DB) — what "repérer" points at.
const SRC_FRONT = { D: [1], F: [7] }
const SRC_BACK = { D: [7], B: [7] }

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
      body: 'Le premier étage est fini. On remplit maintenant l’étage du milieu : ses quatre arêtes, une par côté, surlignées sur l’image. Chacune a deux couleurs et aucune n’est jaune — le jaune, c’est pour le dernier étage. Chaque arête descend de l’étage du bas dans sa fente avec un seul geste, qui a une version « vers la droite » et son miroir « vers la gauche ».',
      visual: { state: 'second-layer', highlight: MIDDLE_BAND }
    },
    {
      kind: 'understand',
      title: 'Repérer l’arête et son sens',
      body: 'Cherche dans l’étage du bas une arête sans jaune — ici la vert-rouge, surlignée. Sa couleur de face indique sa colonne : tourne le bas pour la poser pile sous le centre de la même couleur. Son autre couleur regarde alors soit à droite, soit à gauche : c’est elle qui choisit la version du geste.',
      visual: {
        state: { caseOf: 'second-layer-insert-right', goal: 'second-layer' },
        highlight: SRC_FRONT
      }
    },
    {
      kind: 'demo',
      title: 'Elle part à droite',
      body: 'L’autre couleur part à droite : on aligne la couleur de face sous son centre, puis on déroule. L’arête plonge et se glisse dans sa fente avant-droite, le blanc du dessus intact. Suis-le coup par coup.',
      algorithmId: 'second-layer-insert-right',
      demoFrom: 'case',
      goal: 'second-layer'
    },
    {
      kind: 'demo',
      title: 'Elle part à gauche — le miroir',
      body: 'Même arête, mais l’autre couleur part à gauche : c’est le geste précédent vu dans le miroir, mouvement pour mouvement. Elle se glisse dans sa fente avant-gauche. Si tu sais faire celui de droite, tu sais déjà celui-ci.',
      algorithmId: 'second-layer-insert-front-left',
      demoFrom: 'case',
      goal: 'second-layer'
    },
    {
      kind: 'understand',
      title: 'Les fentes du fond',
      body: 'Parfois l’arête appartient à une fente du fond — ici la bleu-rouge, surlignée en bas à l’arrière. Le principe ne change pas : tu l’amènes sous sa colonne, et le geste se joue cette fois avec la face du fond. Là encore, une version qui l’envoie à droite, une qui l’envoie à gauche.',
      visual: {
        state: { caseOf: 'second-layer-insert-back-right', goal: 'second-layer' },
        highlight: SRC_BACK
      }
    },
    {
      kind: 'demo',
      title: 'Au fond, à droite',
      body: 'La fente est à l’arrière-droite : on aligne l’arête, puis on déroule le geste joué avec la face du fond. Elle remonte se caler dans sa fente, sans toucher au premier étage.',
      algorithmId: 'second-layer-insert-back-right',
      demoFrom: 'case',
      goal: 'second-layer'
    },
    {
      kind: 'demo',
      title: 'Au fond, à gauche — le miroir',
      body: 'Et son miroir, pour la fente arrière-gauche : le même geste réfléchi, joué avec la face du fond de l’autre côté. L’arête se glisse dans sa fente et l’étage du milieu se referme.',
      algorithmId: 'second-layer-insert-back-left',
      demoFrom: 'case',
      goal: 'second-layer'
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : tout l’étage du milieu',
      body: 'Pars du premier étage fini et place les quatre arêtes toi-même. Pour chacune : repère une arête sans jaune en bas, aligne sa couleur de face sous le bon centre, puis déroule le geste — du bon côté, et avec la face du fond si la fente est à l’arrière. La pastille indique le prochain coup. C’est gagné quand les deux premiers étages sont pleins.',
      scenario: SCENARIO
    }
  ]
}
