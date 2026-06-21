import type { Lesson } from './types'

// Chapitre 6 — Placer les coins. Send the last-layer corners to their homes with the
// orientation-safe corner cycle (a-perm), keeping them yellow. The demo runs a-perm on
// its clean canonical case: ONE corner is already home, at the front-left (D[0]), and
// the cycle sends the other three home. No yellow leaves the bottom face.

// The four corners of the bottom (yellow) face — the goal.
const D_CORNERS = { D: [0, 2, 6, 8] }
// The already-placed reference corner, at the front-left.
const PLACED_REF = { D: [0] }

export const placeCorners: Lesson = {
  id: 'place-corners',
  title: 'Placer les coins',
  method: 'beginner',
  order: 6,
  steps: [
    {
      kind: 'understand',
      title: 'Chaque coin chez lui',
      body: 'Le dessous est tout jaune. Le but maintenant : que chaque coin soit chez lui, ses deux couleurs de côté en face des bons centres — les coins surlignés sur l’image. Ils sont déjà jaunes et le resteront ; on ne fait que les échanger entre eux.',
      visual: { state: 'yellow-corners-placed', highlight: D_CORNERS }
    },
    {
      kind: 'understand',
      title: 'Le coin déjà bien placé',
      body: 'Regarde chaque coin et ses deux couleurs de côté : s’il longe les bons centres, il est chez lui. Souvent un seul l’est — ici l’avant-gauche, surligné — parfois aucun. La règle : garde ce coin déjà bon à l’avant-gauche, le geste enverra les trois autres chez eux. Aucun coin bon ? Déroule le geste une fois quand même : il en place au moins un, et tu recommences.',
      visual: { state: { caseOf: 'a-perm', goal: 'yellow-corners-placed' }, highlight: PLACED_REF }
    },
    {
      kind: 'demo',
      title: 'Le cycle des coins',
      body: 'Le coin déjà bon est à l’avant-gauche : déroule le cycle. Les trois autres glissent chez eux sans se retourner — le jaune reste dessous tout du long. Suis-le coup par coup.',
      algorithmId: 'a-perm',
      demoFrom: 'case',
      goal: 'yellow-corners-placed'
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : chaque coin chez lui',
      body: 'Pars du dessous tout jaune et renvoie les coins chez eux. Garde un coin déjà bon à l’avant-gauche, déroule le cycle, recommence si besoin. Le jaune reste dessous tout du long. La pastille indique le prochain coup. C’est gagné quand les quatre coins ont leurs côtés alignés sur les bons centres.',
      scenario: {
        phase: 'place-corners',
        from: 'yellow-corners-oriented',
        to: 'yellow-corners-placed'
      }
    }
  ]
}
