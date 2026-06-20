import type { Lesson, TeachingScenario } from './types'

// Chapitre 5 — Orienter les coins. Make the whole last (yellow) face one colour with
// Sune and its mirror Anti-Sune. The chapter milestone is the real
// `yellow-corners-oriented` state (full yellow face), reached by the teaching solver.

// The whole bottom (yellow) face.
const YELLOW_FACE = { D: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
// The four corners of the bottom (yellow) face — what these gestures turn.
const D_CORNERS = { D: [0, 2, 6, 8] }

const SCENARIO: TeachingScenario = {
  phase: 'orient-corners',
  from: 'yellow-cross',
  to: 'yellow-corners-oriented'
}

export const orientCorners: Lesson = {
  id: 'orient-corners',
  title: 'Orienter les coins',
  method: 'beginner',
  order: 5,
  steps: [
    {
      kind: 'understand',
      title: 'Tout le dessous en jaune',
      body: 'La croix jaune est là, mais les coins du dessous regardent encore de travers : leur jaune pointe sur le côté, pas vers le bas. Le but de ce chapitre : les redresser pour que toute la face du dessous devienne jaune, surlignée sur l’image. Les coins restent à leur place — on ne fait que les faire pivoter sur eux-mêmes.',
      visual: { state: 'yellow-corners-oriented', highlight: YELLOW_FACE }
    },
    {
      kind: 'demo',
      title: 'Sune',
      body: 'Voici Sune. Tourne le bas pour qu’un coin déjà jaune en dessous soit en haut à gauche, puis déroule le geste. Regarde les autres coins basculer, leur jaune venant vers le bas. Souvent il faut répéter Sune deux ou trois fois — chaque passage rapproche du tout-jaune.',
      scenario: SCENARIO,
      groupIndex: 0
    },
    {
      kind: 'understand',
      title: 'Anti-Sune, le miroir',
      body: 'Quand les coins penchent dans l’autre sens, Anti-Sune fait le travail inverse de Sune — même logique, mains en miroir. C’est le même outil vu de l’autre côté, et il évite parfois un Sune de trop.',
      visual: { state: { caseOf: 'anti-sune' }, highlight: D_CORNERS }
    },
    {
      kind: 'demo',
      title: 'Anti-Sune',
      body: 'Déroule Anti-Sune et regarde les coins basculer jaune vers le bas, comme avec Sune mais dans l’autre sens. La pastille « Placement » marque les petits tours du bas qui mettent le bon coin au bon endroit avant le geste.',
      scenario: SCENARIO,
      groupIndex: 1
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : tout le dessous en jaune',
      body: 'Pars de la croix jaune et redresse les quatre coins. Regarde combien de coins sont déjà jaunes en dessous, place-les comme le demande Sune (ou Anti-Sune), et déroule — au besoin plusieurs fois. La pastille indique le prochain coup. C’est gagné quand toute la face du dessous est jaune.',
      scenario: SCENARIO
    }
  ]
}
