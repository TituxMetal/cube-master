import type { Lesson } from './types'

// Chapitre 1 — La croix blanche. The proof-slice chapter (D-WHITECROSS): keeps the
// intuitive matching (understand + visuals, incl. the one-off "good cross vs sides
// not matching" comparison on a real partial cube) and gains a real demo +
// practice for the flipped-edge case using the promoted `white-cross-flip`
// algorithm, demoed case → solved.
// Only the cross itself: the white centre plus the four U edges (the plus shape),
// and each side face's top-centre edge (its colour band). Corners are not part of
// the cross — they come later. The centre belongs to the cross, so it stays lit.
const U_CROSS: readonly number[] = [1, 3, 4, 5, 7]
const SIDE_EDGE: readonly number[] = [1]
const CROSS_HIGHLIGHT = {
  U: U_CROSS,
  F: SIDE_EDGE,
  R: SIDE_EDGE,
  B: SIDE_EDGE,
  L: SIDE_EDGE
}

export const whiteCross: Lesson = {
  id: 'white-cross',
  title: 'La croix blanche',
  method: 'beginner',
  order: 1,
  steps: [
    {
      kind: 'understand',
      title: "La croix blanche, c'est quoi",
      body: "Bienvenue — on commence par le tout début : la croix blanche. Quatre arêtes blanches sur la face du haut, chacune alignée avec le centre de sa couleur. Bonne nouvelle : ici, presque tout se fait à l'œil, sans rien mémoriser. Voici le but : sur un cube encore mélangé, la croix blanche est faite dessus, et un bandeau de couleurs suit tout autour (le reste viendra après).",
      visual: { state: 'white-cross-only', highlight: CROSS_HIGHLIGHT }
    },
    {
      kind: 'understand',
      title: 'Le secret : la couleur de côté',
      body: "Le réflexe qui change tout : chaque arête blanche a une deuxième couleur, et c'est elle qui commande. Une arête blanc-rouge va sous le centre rouge. Aligne d'abord la couleur de côté avec son centre, ensuite seulement rabats-la sur le dessus. À gauche, une vraie croix dont les côtés suivent ; à droite, une croix qui a l'air bonne mais dont les côtés ne tombent pas en face des centres — l'erreur classique.",
      compare: {
        left: {
          visual: { state: 'white-cross-only', highlight: CROSS_HIGHLIGHT },
          caption: 'Bonne croix : chaque côté suit son centre.'
        },
        right: {
          visual: { state: 'cross-misaligned', highlight: CROSS_HIGHLIGHT },
          caption: "Côtés non alignés : l'erreur classique."
        }
      }
    },
    {
      kind: 'understand',
      title: 'Amener une arête chez elle',
      body: "En pratique, pour chaque arête : repère-la, amène-la sous le centre de sa couleur en tournant le bas, puis rabats-la d'un demi-tour de la face de côté. Le blanc se retrouve en haut, la couleur de côté pile sur son centre. Voici le résultat une fois les quatre amenées — la croix est faite, le reste du cube attend encore.",
      visual: { state: 'white-cross-only', highlight: CROSS_HIGHLIGHT }
    },
    {
      kind: 'demo',
      title: "Quand l'arête est à l'envers",
      body: "Un seul cas résiste : l'arête est au bon endroit, mais le blanc est tourné vers l'avant (la face devant toi) au lieu d'être sur le dessus. Cette petite séquence la retourne en place — pars du cas et regarde-la se résoudre, coup par coup, jusqu'à la croix.",
      algorithmId: 'white-cross-flip',
      demoFrom: 'case'
    },
    {
      kind: 'practice',
      title: 'À toi de jouer',
      body: "À ton tour : voici ce cas embêtant, le blanc tourné vers l'avant. Déroule la séquence et regarde l'arête se remettre droite. Quand le cube est revenu résolu, tu as bouclé ta première croix.",
      algorithmId: 'white-cross-flip'
    }
  ]
}
