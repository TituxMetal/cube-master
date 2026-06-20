import type { Lesson, TeachingScenario } from './types'

// Chapitre 2 — Les coins blancs. Reworked end-to-end on the teaching solver
// (D-DEMO-DECOUPLE / D-PRACTICE-SOLVER): teach a recognize → place → trigger rhythm
// with one gesture (the sexy move R' D' R D) and its mirror (L D L' D'), the slot
// and piece brought into position with intuitive U/D turns — never a cube rotation.
// Several demos on different representative cases (a simple front-right insert, a
// back corner placed via U-setup, the left mirror), then a full-chapter practice
// that completes the whole first layer from the white-cross milestone.

// The whole white face plus each side's top corners — the first layer.
const FIRST_LAYER = {
  U: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  F: [0, 2],
  R: [0, 2],
  B: [0, 2],
  L: [0, 2]
}

// Every demo and the practice run the same teaching plan: white cross → whole first
// layer. A demo names a group of that plan (a single corner, on the realistic cube
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
      title: 'Finir le premier étage',
      body: 'Ta croix blanche est faite, en haut. On complète maintenant tout le premier étage en posant les quatre coins blancs. Un coin porte trois couleurs et va exactement là où ces trois couleurs se rejoignent : le coin blanc-vert-rouge entre la face blanche, la verte et la rouge. Voici le but — la face blanche entière, avec les côtés qui suivent.',
      visual: { state: 'white-corners', highlight: FIRST_LAYER }
    },
    {
      kind: 'understand',
      title: 'Un seul geste : le sexy move',
      body: "Tout le chapitre tient dans un geste, le plus important de la méthode : le sexy move, R' D' R D. Il travaille toujours au même endroit — le coin avant-droit, en haut. L'idée : on amène un coin blanc dans l'étage du bas, juste sous la place où il doit monter, puis on répète le sexy move jusqu'à ce qu'il se loge, blanc vers le haut.",
      visual: { state: { caseOf: 'sexy-move', goal: 'white-corners' } }
    },
    {
      kind: 'demo',
      title: 'Le cas simple',
      body: "Regarde le cas le plus facile. Le coin attend déjà dans le bas : on le glisse sous sa place avec un petit tour du bas (D'), puis un seul sexy move R' D' R D le soulève et le pose, bien orienté. Repère les deux temps : d'abord placer, ensuite le geste.",
      scenario: SCENARIO,
      groupIndex: 0
    },
    {
      kind: 'understand',
      title: 'Placer avant d’agir — sans tourner le cube',
      body: "Le sexy move agit toujours à l'avant-droit, et on ne tourne jamais le cube. Alors comment poser un coin qui appartient ailleurs ? On amène les choses à lui. Le bas (D) fait défiler les coins qui attendent : on en met un sous l'avant-droit. Et si la place visée est au fond, on l'amène à l'avant avec un tour du haut (U), on fait le geste, puis on remet le haut comme il était (U'). Ces tours U et D ne sont pas un algorithme à retenir — juste « amène-le devant, range-le après ».",
      visual: { state: 'white-corners', highlight: FIRST_LAYER }
    },
    {
      kind: 'demo',
      title: 'Un coin du fond',
      body: "Ici le coin appartient à l'arrière. On amène sa place à l'avant avec un tour du haut (U), on déroule le sexy move jusqu'à ce que le blanc pointe en haut, puis on remet le haut en place (U'). Le badge te montre les deux temps : « Placement » pour les tours d'installation, « Sexy Move » pour le geste lui-même.",
      scenario: SCENARIO,
      groupIndex: 1
    },
    {
      kind: 'understand',
      title: 'L’autre main : le miroir',
      body: "Un coin qui appartient à l'avant-gauche se pose sans le promener jusqu'à droite : on a le geste en miroir, L D L' D'. Même histoire, côté gauche. Avec le sexy move à droite et son miroir à gauche, tu atteins les quatre coins en n'amenant chaque place qu'à l'avant — jamais besoin de retourner le cube.",
      visual: { state: { caseOf: 'sexy-move-mirror', goal: 'white-corners' } }
    },
    {
      kind: 'demo',
      title: 'Le miroir en action',
      body: "Regarde le miroir L D L' D' poser un coin avant-gauche, exactement comme le sexy move à droite. Trois passages ici pour orienter le blanc vers le haut — sur un vrai cube, tu répètes le geste jusqu'à ce qu'il soit bien posé.",
      scenario: SCENARIO,
      groupIndex: 3
    },
    {
      kind: 'chapter-practice',
      title: 'À toi : tout le premier étage',
      body: "Pars de ta croix blanche et pose les quatre coins toi-même, de bout en bout. Pour chaque coin : repère sa place, amène la place à l'avant et le coin juste dessous, puis déroule le sexy move (ou son miroir à gauche) jusqu'à ce qu'il se loge. La pastille indique le prochain coup. C'est gagné quand tout le premier étage est fait.",
      scenario: SCENARIO
    }
  ]
}
