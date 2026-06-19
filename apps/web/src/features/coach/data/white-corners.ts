import type { Lesson } from './types'

// Chapitre 2 — Les coins blancs. Completes the first (white) layer with the sexy
// move (R' D' R D), the foundational trigger. Demo + practice anchor on the
// white-corners milestone (the whole white layer done, the rest still mixed).
// The whole white face plus each side's top corners — the first layer.
const FIRST_LAYER = {
  U: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  F: [0, 2],
  R: [0, 2],
  B: [0, 2],
  L: [0, 2]
}

export const whiteCorners: Lesson = {
  id: 'white-corners',
  title: 'Les coins blancs',
  method: 'beginner',
  order: 2,
  steps: [
    {
      kind: 'understand',
      title: 'Finir le premier étage',
      body: 'Ta croix est faite. On complète maintenant tout le premier étage en posant les quatre coins blancs. Un coin porte trois couleurs et va exactement là où ces trois couleurs se rejoignent. Voici le but : la face blanche entière, avec les côtés qui suivent.',
      visual: { state: 'white-corners', highlight: FIRST_LAYER }
    },
    {
      kind: 'understand',
      title: 'Le sexy move',
      body: "Voici ton premier vrai algorithme — et le plus important de toute la méthode : le sexy move, R' D' R D. L'idée : amène un coin blanc dans l'étage du bas, juste sous l'emplacement où il doit monter, puis répète le sexy move jusqu'à ce qu'il se loge, blanc vers le haut.",
      visual: { state: { caseOf: 'sexy-move', goal: 'white-corners' } }
    },
    {
      kind: 'demo',
      title: 'Regarde le sexy move agir',
      body: 'Regarde-le travailler : le coin est soulevé hors de sa place, promené, puis reposé bien orienté. Le même geste revient partout dans la méthode, alors prends le temps de mémoriser le mouvement de tes doigts.',
      algorithmId: 'sexy-move',
      demoFrom: 'case',
      goal: 'white-corners'
    },
    {
      kind: 'practice',
      title: 'Cale le coin',
      body: "À toi : un coin blanc attend en bas, sous sa place. Déroule le sexy move R' D' R D et regarde-le se caler pendant que le premier étage se referme. (Sur un vrai cube, tu répètes le geste jusqu'à ce que le blanc pointe vers le haut.)",
      algorithmId: 'sexy-move',
      goal: 'white-corners'
    }
  ]
}
