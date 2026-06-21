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
      body: 'Le dessous est tout jaune. Le but maintenant : que chaque coin soit chez lui, ses deux couleurs de côté en face des bons centres — les coins surlignés sur l’image. Ils sont déjà jaunes et le resteront ; on ne fait que les déplacer entre eux.',
      visual: { state: 'yellow-corners-placed', highlight: D_CORNERS }
    },
    {
      kind: 'understand',
      title: 'Repérer un coin mal placé',
      body: 'Regarde un coin et ses deux couleurs de côté : si elles ne longent pas les bonnes faces, il est mal placé. Souvent un seul coin est déjà bon, parfois aucun. Le geste de ce chapitre échange trois coins d’un coup pour les renvoyer chez eux, sans les retourner : le jaune reste en dessous.',
      visual: {
        state: { caseOf: 'a-perm', goal: 'yellow-corners-placed' },
        highlight: D_CORNERS
      }
    },
    {
      kind: 'demo',
      title: 'Le cycle des coins',
      body: 'Ce geste échange trois coins entre eux sans les retourner — le jaune reste en bas. Cherche un coin déjà bien placé, amène-le devant à gauche en tournant le bas, puis déroule le cycle : les trois autres glissent chez eux. Si aucun coin n’est bon, déroule-le une fois quand même, il en met au moins un en place, et tu recommences.',
      scenario: SCENARIO,
      groupIndex: 0
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : chaque coin chez lui',
      body: 'Pars du dessous tout jaune et renvoie les coins chez eux. Garde un coin déjà bon devant à gauche, déroule le cycle, recommence si besoin. Le jaune reste en dessous tout du long. La pastille indique le prochain coup. C’est gagné quand les quatre coins ont leurs côtés alignés sur les bons centres.',
      scenario: SCENARIO
    }
  ]
}
