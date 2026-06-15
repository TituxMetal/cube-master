import type { Lesson } from './types'

// Chapitre 1 — La croix blanche. The proof-slice chapter (D-WHITECROSS): keeps the
// intuitive matching (understand + visuals, incl. the one-off "good cross vs sides
// not matching" comparison) and gains a real demo + practice for the flipped-edge
// case using the promoted `white-cross-flip` algorithm, demoed case → solved.
const SIDE_TOP_ROW: readonly number[] = [0, 1, 2]
const U_EDGES: readonly number[] = [1, 3, 5, 7]

export const whiteCross: Lesson = {
  id: 'white-cross',
  title: 'La croix blanche',
  method: 'beginner',
  order: 1,
  steps: [
    {
      kind: 'understand',
      title: "La croix blanche, c'est quoi",
      body: "Bienvenue — on commence par le tout début : la croix blanche. Quatre arêtes blanches sur la face du haut, chacune alignée avec le centre de sa couleur. Bonne nouvelle : ici, presque tout se fait à l'œil, sans rien mémoriser. Regarde le but : la croix blanche dessus, et un bandeau de couleurs qui suit tout autour.",
      visual: {
        state: 'solved',
        highlight: {
          U: U_EDGES,
          F: SIDE_TOP_ROW,
          R: SIDE_TOP_ROW,
          B: SIDE_TOP_ROW,
          L: SIDE_TOP_ROW
        }
      }
    },
    {
      kind: 'understand',
      title: 'Le secret : la couleur de côté',
      body: "Le réflexe qui change tout : chaque arête blanche a une deuxième couleur, et c'est elle qui commande. Une arête blanc-rouge va sous le centre rouge. Aligne d'abord la couleur de côté avec son centre, ensuite seulement rabats-la sur le dessus. À gauche, une vraie croix dont les côtés suivent ; à droite, une croix qui a l'air bonne mais dont les côtés ne tombent pas en face des centres — l'erreur classique.",
      compare: {
        left: {
          visual: {
            state: 'solved',
            highlight: { F: SIDE_TOP_ROW, R: SIDE_TOP_ROW, B: SIDE_TOP_ROW, L: SIDE_TOP_ROW }
          },
          caption: 'Bonne croix : chaque côté suit son centre.'
        },
        right: {
          visual: {
            state: 'cross-misaligned',
            highlight: { F: SIDE_TOP_ROW, R: SIDE_TOP_ROW, B: SIDE_TOP_ROW, L: SIDE_TOP_ROW }
          },
          caption: "Côtés non alignés : l'erreur classique."
        }
      }
    },
    {
      kind: 'understand',
      title: 'Amener une arête chez elle',
      body: "En pratique : repère une arête blanche, amène-la sous le centre de sa couleur en tournant le bas, puis rabats-la d'un demi-tour de la face de côté. Le blanc se retrouve en haut, la couleur de côté pile sur son centre. Recommence pour les quatre, dans l'ordre que tu veux.",
      visual: { state: 'solved', highlight: { U: [7], F: [1] } }
    },
    {
      kind: 'demo',
      title: "Quand l'arête est à l'envers",
      body: "Un seul cas résiste : l'arête est au bon endroit, mais le blanc est sur le côté au lieu du dessus. Cette petite séquence la retourne en place — pars du cas embêtant et regarde-la se résoudre, coup par coup, jusqu'à la croix.",
      algorithmId: 'white-cross-flip',
      demoFrom: 'case'
    },
    {
      kind: 'practice',
      title: 'À toi de jouer',
      body: "À ton tour : voici ce cas embêtant. Déroule la séquence et regarde l'arête se remettre droite. Quand le cube est revenu résolu, tu as bouclé ta première croix.",
      algorithmId: 'white-cross-flip'
    }
  ]
}
