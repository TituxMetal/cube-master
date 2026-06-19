import type { Lesson } from './types'

// Chapitre 4 — La croix jaune. First last-layer step: turn the yellow pattern on
// the bottom face into a full yellow cross. Two cases (line, L) with their own
// algorithms; the dot is mentioned in prose (apply once, look again). Demos +
// practice anchor on the yellow-cross milestone (first two layers + the cross).
// The yellow cross on the bottom (D) face: its centre plus the four edges.
const YELLOW_CROSS = { D: [1, 3, 4, 5, 7] }

export const yellowCross: Lesson = {
  id: 'yellow-cross',
  title: 'La croix jaune',
  method: 'beginner',
  order: 4,
  steps: [
    {
      kind: 'understand',
      title: 'Le dernier étage',
      body: 'Les deux premiers étages sont finis — on attaque le dernier, le jaune, sur la face du dessous. Première étape : y dessiner une croix jaune, comme on l’a fait en blanc. Selon ce que tu vois en jaune — un point, une barre, ou un L — un petit geste transforme la figure en croix.',
      visual: { state: 'yellow-cross', highlight: YELLOW_CROSS }
    },
    {
      kind: 'demo',
      title: 'De la barre à la croix',
      body: 'Si tu vois une barre jaune, tiens-la à l’horizontale et déroule cette séquence : les deux arêtes manquantes se rabattent et la croix apparaît. (Un simple point ? Applique le geste une fois, et tu obtiens une barre ou un L à reprendre.)',
      algorithmId: 'yellow-cross-line',
      demoFrom: 'case',
      goal: 'yellow-cross'
    },
    {
      kind: 'understand',
      title: 'Et le L',
      body: 'Si tu vois un L jaune (deux arêtes en coude), place-le en haut à gauche et c’est presque le même geste. Reconnaître la figure de départ, c’est tout le travail ; le reste, ce sont les mains.',
      visual: { state: { caseOf: 'yellow-cross-l', goal: 'yellow-cross' } }
    },
    {
      kind: 'demo',
      title: 'Du L à la croix',
      body: 'Place le L en haut à gauche et déroule la séquence. Regarde le coude se compléter jusqu’à la croix jaune.',
      algorithmId: 'yellow-cross-l',
      demoFrom: 'case',
      goal: 'yellow-cross'
    },
    {
      kind: 'practice',
      title: 'Forme la croix',
      body: 'À toi : une barre jaune attend, à l’horizontale. Déroule la séquence et regarde la croix jaune se former.',
      algorithmId: 'yellow-cross-line',
      goal: 'yellow-cross'
    }
  ]
}
