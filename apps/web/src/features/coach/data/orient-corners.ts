import type { Lesson } from './types'

// Chapitre 5 — Orienter les coins. Make the whole last (yellow) face one colour
// with Sune and its mirror Anti-Sune. These are last-layer steps: the first two
// layers + the yellow cross are genuinely complete, so the demos resolve to solved
// (the honest "near-done → done" case, not the misleading fake PD6 rejects).
// The four corners of the bottom (yellow) face.
const D_CORNERS = { D: [0, 2, 6, 8] }

export const orientCorners: Lesson = {
  id: 'orient-corners',
  title: 'Orienter les coins',
  method: 'beginner',
  order: 5,
  steps: [
    {
      kind: 'understand',
      title: 'Tout le dessous en jaune',
      body: 'La croix jaune est là, mais les coins regardent encore de travers. Le but de ce chapitre : redresser ces coins pour que toute la face du dessous devienne jaune. Les coins sont déjà à la bonne place — il ne reste qu’à les faire pivoter sur eux-mêmes.',
      visual: { state: { caseOf: 'sune' }, highlight: D_CORNERS }
    },
    {
      kind: 'demo',
      title: 'Sune',
      body: 'Voici Sune. Tourne le bas pour qu’un coin jaune soit déjà bon en haut à gauche, puis déroule la séquence. Regarde les autres coins se redresser, jaune vers le bas. (Parfois il faut répéter Sune deux ou trois fois.)',
      algorithmId: 'sune',
      demoFrom: 'case',
      goal: 'solved'
    },
    {
      kind: 'understand',
      title: 'Anti-Sune, le miroir',
      body: 'Quand les coins penchent dans l’autre sens, Anti-Sune fait le travail inverse de Sune. Même logique, mains miroir : c’est le même outil vu de l’autre côté.',
      visual: { state: { caseOf: 'anti-sune' }, highlight: D_CORNERS }
    },
    {
      kind: 'demo',
      title: 'Anti-Sune',
      body: 'Déroule Anti-Sune et regarde les coins basculer jaune vers le bas, comme avec Sune mais dans l’autre sens.',
      algorithmId: 'anti-sune',
      demoFrom: 'case',
      goal: 'solved'
    },
    {
      kind: 'practice',
      title: 'Redresse les coins',
      body: 'À toi : les coins jaunes sont en place mais penchés. Déroule Sune et regarde la face du dessous devenir entièrement jaune.',
      algorithmId: 'sune',
      goal: 'solved'
    }
  ]
}
