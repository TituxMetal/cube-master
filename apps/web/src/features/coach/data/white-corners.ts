import type { Lesson, TeachingScenario } from './types'

// Chapitre 2 — Les coins blancs. Reworked end-to-end on the teaching solver
// (D-DEMO-DECOUPLE / D-PRACTICE-SOLVER): teach a recognize → place → trigger rhythm
// with one gesture (the sexy move R' D' R D) and its mirror (L D L' D'). Several
// demos on different, recognisable cases, then a full-chapter practice that closes
// the whole top crown from the white cross.

// Goal visual — the finished top crown: the white face plus its side band, with the
// four side centres it must match.
const CROWN = {
  U: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  F: [0, 1, 2, 4],
  R: [0, 1, 2, 4],
  B: [0, 1, 2, 4],
  L: [0, 1, 2, 4]
}
// The four corner houses on top (U corners), still to be filled.
const CORNER_HOUSES = { U: [0, 2, 6, 8] }
// A single empty corner house: front-right (UFR) and front-left (ULF).
const HOUSE_FR = { U: [8], F: [2], R: [0] }
const HOUSE_FL = { U: [6], F: [0], L: [2] }

// Every demo and the practice run the same teaching plan: white cross → whole top
// crown. A demo names one group of that plan (a single corner, on the realistic cube
// where the earlier corners are already placed); the practice runs the lot.
const SCENARIO: TeachingScenario = {
  phase: 'white-corners',
  from: 'white-cross-only',
  to: 'white-corners'
}

export const whiteCorners: Lesson = {
  id: 'white-corners',
  title: 'Les coins blancs',
  method: 'beginner',
  order: 2,
  steps: [
    {
      kind: 'understand',
      title: 'Compléter la couronne du haut',
      body: 'Ta croix blanche est faite. On complète maintenant la première couronne — le dessus blanc et tout son tour. Il reste à poser les quatre coins. Un coin porte trois couleurs et n’a qu’une seule maison : l’angle où ces trois couleurs retrouvent les trois centres voisins. Sur l’image, la couronne à fermer et ses centres de référence sont mis en avant.',
      visual: { state: 'white-corners', highlight: CROWN }
    },
    {
      kind: 'understand',
      title: 'Le geste unique : le sexy move',
      body: 'Tout le chapitre tient dans un seul geste : le sexy move, R’ D’ R D. Il travaille toujours à la même maison, en haut à l’avant-droite. Le principe tient en deux temps : on amène d’abord un coin blanc dans l’étage du bas, juste sous sa maison ; on répète ensuite le sexy move jusqu’à ce qu’il remonte et se cale, blanc vers le haut. Ici, la maison avant-droite (surlignée) n’a pas encore son coin.',
      visual: { state: { caseOf: 'sexy-move', goal: 'white-corners' }, highlight: HOUSE_FR }
    },
    {
      kind: 'demo',
      title: 'Un coin déjà prêt en bas',
      body: 'Le cas le plus simple. Repère un coin avec une face blanche qui traîne dans l’étage du bas, blanc tourné sur le côté. On le glisse sous sa maison avec un petit tour du bas (D’), puis un seul sexy move le hisse et le pose, bien orienté. Suis les deux temps : on installe, puis on déroule le geste.',
      scenario: SCENARIO,
      groupIndex: 0
    },
    {
      kind: 'understand',
      title: 'Installer la pièce avant le geste',
      body: 'Le sexy move agit toujours à l’avant-droite ; pour t’en servir partout, tu amènes les pièces à lui. L’étage du bas (D) fait défiler les coins qui attendent : tu places celui qui t’intéresse juste sous l’avant-droite. Et si sa maison est à l’arrière, tu l’amènes devant avec un tour du haut (U), tu fais le geste, puis tu remets le haut (U’). Sur l’image : la croix est là, mais les quatre maisons de coins (surlignées) sont encore vides — et leurs coins t’attendent plus bas.',
      visual: { state: 'white-cross-only', highlight: CORNER_HOUSES }
    },
    {
      kind: 'demo',
      title: 'Un coin dont la maison est à l’arrière',
      body: 'Cette fois la maison du coin est à l’arrière. On l’amène devant avec un tour du haut (U), on déroule le sexy move jusqu’à ce que le blanc pointe en haut, puis on remet le haut comme il était (U’). La pastille montre les deux temps : « Placement » pour les tours d’installation, « Sexy Move » pour le geste.',
      scenario: SCENARIO,
      groupIndex: 1
    },
    {
      kind: 'understand',
      title: 'L’autre main : le miroir',
      body: 'Un coin dont la maison est à l’avant-gauche se pose avec le geste en miroir : L D L’ D’. Même histoire, côté gauche. Une main pour chaque côté avant — le sexy move à droite, son miroir à gauche — et tu atteins les quatre coins. Ici, la maison avant-gauche (surlignée) attend le sien.',
      visual: { state: { caseOf: 'sexy-move-mirror', goal: 'white-corners' }, highlight: HOUSE_FL }
    },
    {
      kind: 'demo',
      title: 'Le miroir en action',
      body: 'Regarde le miroir L D L’ D’ poser un coin avant-gauche, exactement comme le sexy move à droite. Trois passages ici pour que le blanc finisse en haut — sur un vrai cube, tu répètes jusqu’à ce qu’il soit calé.',
      scenario: SCENARIO,
      groupIndex: 3
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : toute la couronne',
      body: 'Pars de ta croix et pose les quatre coins toi-même. Pour chacun : repère sa maison, amène la maison à l’avant et le coin juste dessous, puis déroule le sexy move (ou son miroir à gauche) jusqu’à ce qu’il se cale. La pastille indique le prochain coup. C’est gagné quand toute la couronne du haut est faite.',
      scenario: SCENARIO
    }
  ]
}
