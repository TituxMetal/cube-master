import type { Lesson, TeachingScenario } from './types'

// Chapitre 4 — La croix jaune. First last-layer step: turn the yellow pattern on the
// bottom face into a full yellow cross. Two cases (line, L) with their own gestures;
// the dot is mentioned in prose. Teaching demos + full-chapter practice.

// The yellow cross on the bottom (D) face: its centre plus the four edges.
const YELLOW_CROSS = { D: [1, 3, 4, 5, 7] }

const SCENARIO: TeachingScenario = {
  phase: 'yellow-cross',
  from: 'second-layer',
  to: 'yellow-cross'
}

export const yellowCross: Lesson = {
  id: 'yellow-cross',
  title: 'La croix jaune',
  method: 'beginner',
  order: 4,
  steps: [
    {
      kind: 'understand',
      title: 'Le dernier étage',
      body: 'Les deux premiers étages sont finis — on attaque le dernier, le jaune, sur la face du dessous. D’abord y dessiner une croix jaune, comme on l’a fait en blanc. Regarde la figure jaune des arêtes du dessous : un point, une barre, ou un L. Selon ce que tu vois, un petit geste la transforme en croix.',
      visual: { state: 'yellow-cross', highlight: YELLOW_CROSS }
    },
    {
      kind: 'demo',
      title: 'De la barre à la croix',
      body: 'Si tu vois une barre jaune, tiens-la à l’horizontale et déroule ce geste : les deux arêtes manquantes se rabattent et la croix apparaît. (Rien qu’un point jaune ? Applique le geste une fois : tu obtiens une barre ou un L, que tu reprends ensuite.)',
      scenario: SCENARIO,
      groupIndex: 0
    },
    {
      kind: 'understand',
      title: 'Le cas du L',
      body: 'Si tu vois un L jaune — deux arêtes en coude —, place le coude au fond à gauche : c’est presque le même geste, avec un point de départ différent. Tout le travail, c’est de reconnaître la figure ; ensuite, ce sont les mains.',
      visual: { state: { caseOf: 'yellow-cross-l', goal: 'yellow-cross' } }
    },
    {
      kind: 'demo',
      title: 'Du L à la croix',
      body: 'Place le coude du L au fond à gauche et déroule le geste : il se complète jusqu’à la croix jaune. C’est presque le geste de la barre, avec une figure de départ différente — tout le travail est dans la reconnaissance.',
      algorithmId: 'yellow-cross-l',
      demoFrom: 'case',
      goal: 'yellow-cross'
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : forme la croix',
      body: 'Pars des deux étages finis et forme la croix jaune. Regarde la figure du dessous, mets-la dans le bon sens, puis déroule le geste de la barre ou du L — au besoin deux fois. La pastille indique le prochain coup. C’est gagné quand la croix jaune est complète.',
      scenario: SCENARIO
    }
  ]
}
