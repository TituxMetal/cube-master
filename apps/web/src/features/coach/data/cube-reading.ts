import type { Lesson } from './types'

// Chapitre 0 — Lire le cube. The interactive notation primer that comes before
// White Cross (D-NOTATION / PD4): name the six faces, learn a quarter turn and
// its inverse hands-on (tap-to-turn, reusing applyMoves), and meet the one
// notation quirk — we keep white on top and turn D, not U.
export const cubeReading: Lesson = {
  id: 'cube-reading',
  title: 'Lire le cube',
  method: 'beginner',
  order: 0,
  steps: [
    {
      kind: 'interactive',
      title: 'Les 6 faces',
      body: "Avant de résoudre quoi que ce soit, parlons la même langue que le cube. Pose-le blanc vers le haut : la face du dessus, c'est U (Up). Dessous D (Down), devant F (Front), derrière B (Back), à gauche L (Left), à droite R (Right). Chaque lettre désigne une face — repère-les sur le schéma, leur centre est mis en avant.",
      faces: ['U', 'D', 'F', 'B', 'L', 'R'],
      moves: []
    },
    {
      kind: 'interactive',
      title: 'Tourner une face',
      body: "Une lettre seule, c'est un quart de tour horaire de cette face. Une apostrophe inverse le sens, un 2 fait un demi-tour. Essaie : touche R pour tourner la face droite, puis R' pour revenir. Lis le coup, regarde le cube bouger — c'est tout le secret de la notation.",
      faces: ['R'],
      moves: ['R', "R'"]
    },
    {
      kind: 'understand',
      title: 'Un détail sur nos coups',
      body: 'Un dernier point avant de commencer. Beaucoup de vidéos tournent la face du haut. Nous, on garde le blanc en haut et on tourne D (le bas) pour le dernier étage. Le geste de la main est le même, seule la lettre change — suis les coups affichés ici et tu ne peux pas te perdre.',
      visual: { state: 'solved', highlight: { D: [0, 1, 2, 3, 4, 5, 6, 7, 8] } }
    }
  ]
}
