import type { Lesson, TeachingScenario } from './types'

// Chapitre 4 — La croix jaune. Turn the yellow edge figure on the bottom face into a
// full yellow cross. Two cases, each on its OWN clean canonical figure (a real bar, a
// real L) so the demo shows exactly what its text names: `yellow-cross-line` is a
// horizontal bar (DL+DR), `yellow-cross-l` is an L whose elbow sits back-left (DB+DL).

// The finished yellow cross (centre + four edges) — the chapter goal.
const YELLOW_CROSS = { D: [1, 3, 4, 5, 7] }
// The bar: the two aligned yellow edges (left + right) with the centre.
const BAR = { D: [3, 4, 5] }
// The L: elbow back-left — the back and left yellow edges with the centre.
const L_SHAPE = { D: [3, 4, 7] }

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
      body: 'Les deux premiers étages sont finis — on attaque le dernier, le jaune, sur la face du dessous. Première marche : y dessiner une croix jaune, surlignée sur l’image (l’objectif du chapitre). Au départ, tes quatre arêtes jaunes ne forment presque jamais la croix : tu auras un simple point, une barre, ou un L. Selon la figure, un petit geste la complète.',
      visual: { state: 'yellow-cross', highlight: YELLOW_CROSS }
    },
    {
      kind: 'understand',
      title: 'La barre',
      body: 'La barre : deux arêtes jaunes alignées de part et d’autre du centre, surlignées sur l’image. Si la tienne est verticale, un tour du bas la couche à l’horizontale. Une fois horizontale, elle est prête.',
      visual: { state: { caseOf: 'yellow-cross-line', goal: 'yellow-cross' }, highlight: BAR }
    },
    {
      kind: 'demo',
      title: 'De la barre à la croix',
      body: 'La barre est à l’horizontale : déroule le geste. Les deux arêtes manquantes (devant et derrière) se rabattent, jaune vers le bas, et la croix apparaît. Suis-le coup par coup.',
      algorithmId: 'yellow-cross-line',
      demoFrom: 'case',
      goal: 'yellow-cross'
    },
    {
      kind: 'understand',
      title: 'Le L',
      body: 'Le L : deux arêtes jaunes en coude, surlignées. Tourne le bas pour amener le coude au fond à gauche — ses deux branches longent alors la face bleue (au fond) et l’orange (à gauche). C’est sa position de départ.',
      visual: { state: { caseOf: 'yellow-cross-l', goal: 'yellow-cross' }, highlight: L_SHAPE }
    },
    {
      kind: 'demo',
      title: 'Du L à la croix',
      body: 'Le coude bien au fond à gauche, déroule le geste : le L se referme en croix. C’est presque le mouvement de la barre, avec une figure de départ différente.',
      algorithmId: 'yellow-cross-l',
      demoFrom: 'case',
      goal: 'yellow-cross'
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : forme la croix',
      body: 'Pars des deux étages finis et forme la croix jaune. Regarde ta figure du dessous. Un simple point ? Déroule le geste une fois : tu obtiens une barre ou un L. Ensuite place-la — barre à l’horizontale, ou coude du L au fond à gauche — et déroule. La pastille indique le prochain coup. C’est gagné quand la croix jaune est complète.',
      scenario: SCENARIO
    }
  ]
}
