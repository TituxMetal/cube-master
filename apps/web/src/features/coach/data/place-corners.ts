import type { Lesson, TeachingScenario } from './types'

// Chapitre 6 — Placer les coins. Send the last-layer corners to their homes with the
// corner 3-cycle, keeping them yellow. The chapter milestone is the real
// `yellow-corners-placed` state (corners home, still oriented).

// The four corners of the bottom (yellow) face.
const D_CORNERS = { D: [0, 2, 6, 8] }

const SCENARIO: TeachingScenario = {
  phase: 'place-corners',
  from: 'yellow-corners-oriented',
  to: 'yellow-corners-placed'
}

export const placeCorners: Lesson = {
  id: 'place-corners',
  title: 'Placer les coins',
  method: 'beginner',
  order: 6,
  steps: [
    {
      kind: 'understand',
      title: 'Chaque coin chez lui',
      body: 'Le dessous est tout jaune, mais certains coins ne sont pas chez eux : leurs couleurs de côté ne tombent pas en face des bons centres. Pour le repérer, regarde un coin et ses deux couleurs de côté — si elles ne longent pas les bonnes faces, il est mal placé. On va échanger trois coins d’un coup pour les renvoyer chez eux, sans toucher au reste.',
      visual: {
        state: { caseOf: 'corner-3-cycle', goal: 'yellow-corners-placed' },
        highlight: D_CORNERS
      }
    },
    {
      kind: 'demo',
      title: 'Le cycle des coins',
      body: 'Ce geste fait tourner trois coins entre eux. Cherche d’abord un coin déjà bien placé (ses deux côtés alignés) et garde-le en haut à droite ; déroule ensuite le geste, et les trois autres glissent vers leur maison.',
      scenario: SCENARIO,
      groupIndex: 0
    },
    {
      kind: 'understand',
      title: 'Si aucun coin n’est bon',
      body: 'Parfois aucun coin n’est encore à sa place. Pas de souci : déroule le cycle une fois depuis n’importe quel coin, et il en met au moins un chez lui. Tu reprends alors avec un coin correct à garder en haut à droite.',
      visual: { state: 'yellow-corners-placed', highlight: D_CORNERS }
    },
    {
      kind: 'demo',
      title: 'Encore un tour',
      body: 'Repère le coin bien placé, garde-le en haut à droite, réaligne le bas si besoin (la pastille « Placement »), et redéroule le cycle. Les derniers coins retrouvent leur maison, couleurs de côté en face des bons centres.',
      scenario: SCENARIO,
      groupIndex: 1
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : chaque coin chez lui',
      body: 'Pars du dessous tout jaune et renvoie les coins chez eux. Garde un coin bien placé en haut à droite, déroule le cycle, recommence tant qu’il en reste de travers. La pastille indique le prochain coup. C’est gagné quand les quatre coins ont leurs côtés alignés sur les bons centres.',
      scenario: SCENARIO
    }
  ]
}
