import type { Lesson } from './types'

// Chapitre 5 — Orienter les coins. Make the whole bottom (yellow) face one colour with
// Sune (and its mirror Anti-Sune). Demos run the catalog gestures on their clean
// canonical cases: the Sune case has ONE corner already yellow-down at the back-left
// (D[6]); the Anti-Sune case has its reference corner at the front-right (D[2]). The
// 0-oriented case (no yellow underneath at all) is handled in prose — one Sune from
// anywhere makes yellow corners appear (engine-verified).

// The whole bottom (yellow) face — the goal.
const YELLOW_FACE = { D: [0, 1, 2, 3, 4, 5, 6, 7, 8] }
// The Sune reference corner: the one already yellow-down, at the back-left.
const SUNE_REF = { D: [6] }
// The Anti-Sune reference corner, at the front-right.
const ANTI_REF = { D: [2] }

export const orientCorners: Lesson = {
  id: 'orient-corners',
  title: 'Orienter les coins',
  method: 'beginner',
  order: 5,
  steps: [
    {
      kind: 'understand',
      title: 'Tout le dessous en jaune',
      body: 'La croix jaune est là, mais les coins regardent encore de travers : leur jaune pointe sur le côté, pas dessous. Le but : les redresser pour que toute la face du dessous devienne jaune, surlignée sur l’image. Les coins ne bougent pas de place — ils pivotent sur eux-mêmes. Un seul geste, Sune, répété au bon endroit, suffit.',
      visual: { state: 'yellow-corners-oriented', highlight: YELLOW_FACE }
    },
    {
      kind: 'understand',
      title: 'La règle du coin jaune',
      body: 'Cherche un coin déjà jaune dessous — ici un seul, surligné, au fond à gauche. La règle tient en une phrase : mets un coin jaune au fond à gauche, puis déroule Sune. Souvent il faut répéter deux ou trois fois, en replaçant à chaque tour un coin jaune au fond à gauche. Et si aucun coin n’est jaune dessous au départ ? Déroule Sune une fois depuis n’importe quelle position : des coins jaunes apparaissent, et tu reprends la règle.',
      visual: { state: { caseOf: 'sune', goal: 'yellow-corners-oriented' }, highlight: SUNE_REF }
    },
    {
      kind: 'demo',
      title: 'Sune',
      body: 'Le coin jaune est au fond à gauche : déroule Sune. Les trois autres coins basculent, leur jaune venant se poser dessous, et la face du dessous devient toute jaune. Suis-le coup par coup.',
      algorithmId: 'sune',
      demoFrom: 'case',
      goal: 'yellow-corners-oriented'
    },
    {
      kind: 'understand',
      title: 'Anti-Sune, le miroir',
      body: 'Quand les coins penchent dans l’autre sens, c’est Anti-Sune : le miroir exact de Sune, joué de l’autre main. Même idée, un coin sert de repère — ici surligné. Bien choisi au bon moment, il t’évite parfois un Sune de trop.',
      visual: {
        state: { caseOf: 'anti-sune', goal: 'yellow-corners-oriented' },
        highlight: ANTI_REF
      }
    },
    {
      kind: 'demo',
      title: 'Anti-Sune',
      body: 'Déroule Anti-Sune : les coins basculent, leur jaune vient dessous, comme avec Sune mais dans l’autre sens. C’est Sune en miroir, tout simplement.',
      algorithmId: 'anti-sune',
      demoFrom: 'case',
      goal: 'yellow-corners-oriented'
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : tout le dessous en jaune',
      body: 'Pars de la croix jaune et redresse les quatre coins. Compte ceux déjà jaunes dessous : aucun ? Un Sune pour démarrer. Sinon, mets un coin jaune au fond à gauche et déroule Sune (ou Anti-Sune si ça tombe mieux) — répète jusqu’à ce que toute la face du dessous soit jaune. La pastille indique le prochain coup.',
      scenario: { phase: 'orient-corners', from: 'yellow-cross', to: 'yellow-corners-oriented' }
    }
  ]
}
