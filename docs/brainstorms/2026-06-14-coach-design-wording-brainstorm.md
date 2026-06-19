---
title: 'Coach design + wording — comprehensible beginner journey (F4 + F5)'
type: brainstorm
date: 2026-06-14
participants: [Titux Metal, Claude]
related:
  - docs/plans/2026-06-13-coach-mode-v1.md (F4 + F5 follow-ups this brainstorm fills)
  - docs/brainstorms/2026-06-12-coach-mode-brainstorm.md (v1 scope + content format)
  - docs/adr/0006-algorithm-catalog-in-domain.md
  - docs/adr/0002-no-client-side-router.md
  - docs/frontend.md
  - GitHub issue #7 — Solver: move direction arrows on cube faces
  - https://cubesolve.com/ (reference, not to copy)
  - https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/ (reference)
---

# Coach design + wording — comprehensible beginner journey (F4 + F5)

> **Language note.** This document is in English (repo docs convention). The **Coach lesson content
> is French by decision** (see D-LANG) — the FR drafts quoted below are the product copy being
> specified, not the document's own language.

## Problem Statement

The in-progress Coach is structurally functional but, reviewed by Titux on 2026-06-14, **does not
actually teach a true beginner anything**. Three concrete failures:

1. **No visual examples.** White Cross shows _nothing_ — not one example. A learner who doesn't yet
   know what `L F B U R D` mean cannot follow prose alone.
2. **Notation is never taught.** The app explains none of the move notation. Even the minimal
   reference sites do this first.
3. **Ergonomics break on a small screen.** On a 13" MacBook Pro (fullscreen browser) you must scroll
   millimetre by millimetre to see prose + cube + moves together — although the information itself
   is small. The CubeNet is not responsive (it was a painful, breakpoint-fought implementation in
   April).

The brevity constraint ("don't bore the reader") was over-applied to the point of
incomprehensibility. The goal is **not** the best cube tutorial on the web — it is a _minimal but
genuinely comprehensible_ beginner guide that is reasonably ergonomic, dark-themed, and uses the
flat CubeNet.

This brainstorm fills follow-ups **F4** (design + wording, PR-gating) **and F5** (last-layer
chapters 4–7) from [the v1 plan](../plans/2026-06-13-coach-mode-v1.md), reframed around
comprehension.

## Context — what exists

Verified 2026-06-14:

- **Player** (`features/coach/components/LessonPlayer.tsx`): vertical stack — header → prose →
  `MoveSequence` → `CubeNet` → `StepControls` (blue, reused from Solver) → reset-notation → nav,
  with the step list as a right sidebar (`1fr_16rem`). The tall left column is the source of the 13"
  scroll.
- **CubeNet** (`features/cube/components/CubeNet.tsx` + `FaceGrid.tsx`): a `grid-cols-4 grid-rows-3`
  cross of fixed-size faces (`size-20` → `md:size-28` → `lg:size-36`). Width-hungry (4 faces wide),
  tall (3 faces). Discrete breakpoint sizing — no fluid behaviour.
- **Content** (`features/coach/data/*`): White Cross is 4 `understand`-only steps (no visual, no
  algo); White Corners + Second Layer carry the **same** "Why our moves look different" notation
  note almost verbatim (redundant).
- **Engine**: every named algorithm a beginner method uses lives in the catalog **except the
  last-layer edge U-perm** — it exists only as the literal spread `[...SUNE, 'D']` /
  `[...ANTI_SUNE, "D'"]` in `solveYellowCorners.ts`. The white-cross flipped-edge fix exists as the
  positional table `FLIPPED_INSERT['UF'] = D R F' R'` in `solveWhiteCross.ts`.
- **GitHub issue #7** (2026-04-06): "Solver: move direction arrows on cube faces" — already open;
  arrows are wanted in Solver too.

References (inspiration): **cubesolve.com** — dedicated animated notation section, highlighted
affected pieces, directional arrows, reassuring tone. **ruwix** — minimal notation primer and the
"good cross vs sides not matching" side-by-side diagram.

## Chosen Approach

Rebuild Coach to **teach, show, and fit one screen**: an interactive notation primer (Chapter 0), a
visual on every step, a compact single-viewport player, a fluid + arrow-capable shared CubeNet, a
narrative French voice, and a demo model that lets case-resolver chapters resolve to solved.
Validate on a White Cross **proof slice** before propagating to all 7 chapters.

## Subjective Contract (revised)

- **Target outcome:** a never-solved, **non-English-speaking** beginner follows the 7 chapters and
  solves a cube — understanding _why_, not just copying moves.
- **Language:** the **entire Coach is French** — lesson prose **and** chrome (buttons, titles). The
  rest of the app (navbar, Solver, Timer) stays English for now. No i18n system (hardcoded FR).
- **Voice:** narrative / vulgarisation — encouraging, concrete, second person. **Never** "1. do
  this 2. do that". Short, but every step is **anchored to a visual** — the lever is the visual, not
  more text.
- **Anti-goals:** an algorithm reference dump; a wall of text; prose that assumes YouTube context; a
  case-grid trainer.
- **Hard constraints:** never 3D (flat CubeNet only); dark theme only.
- **Rejection criteria:**
  - a step that shows nothing (pure prose);
  - **a step with horizontal scroll, or content overflowing its column** (esp. on a 13"; the goal
    stays compact — some vertical scroll, e.g. clearing the navbar or on mobile, is tolerated when
    needed, but never horizontal);
  - a demo that teaches a sequence the solver doesn't execute (no Coach-only invented algorithms);
  - chapter prose longer than a beginner's patience (split into steps with visuals instead).

## Preview And Proof Slice

- **Proof slice:** **White Cross**, rebuilt first on the new layout + fluid CubeNet + Chapter 0
  notation primer, with its `D R F' R'` demo + practice.
- **Required preview:** reviewed live by Titux **specifically on his 13" MacBook Pro** (not just a
  large screen) against this contract, before any other chapter is touched.
- **Rollout rule:** a failure returns the work to the proof slice; only a pass propagates to
  chapters 0/2–7.

## Key Design Decisions

### D-LANG: Coach is French (prose + chrome); rest of app English — RESOLVED

**Decision:** all learner-facing Coach strings in FR; identifiers/comments/commits/docs stay EN.
**Rationale:** real non-anglophone learners are waiting; FR removes the comprehension barrier
entirely. Technically near-free (author strings in FR instead of EN). **Rejected:** a full i18n
layer (NFR-002, no dep, no demand yet) — tracked as a follow-up if usage justifies it. **Note:** a
FR Coach inside an EN app is a deliberate, accepted inconsistency for v1, and a documented deviation
from the repo's English-UI convention.

### D-NOTATION: interactive Chapter 0 + a collapsible cheat-sheet — RESOLVED

**Decision:** a new **Chapter 0 "Lire le cube"** teaches faces (U/D/F/B/L/R), `'` =
counterclockwise, `2` = half turn, with **tap-to-turn** (reusing `applyMove` + CubeNet). The
**D-vs-U note lives here, once**. A **collapsible cheat-sheet** (6 faces + `'`/`2`) is available
inside every lesson. **Rationale:** the single biggest comprehension gap; consolidates the note that
was duplicated across chapters. **Rejected:** per-chapter notation notes (redundant); no primer
(current state — fails a true beginner).

### D-VISUAL: every step carries a visual — RESOLVED

**Decision:** `understand` steps may carry an **illustrative cube state** (e.g. a finished goal, or
a case to recognize) with **piece highlighting**. No step is prose-only. **Rationale:** directly
fixes "White Cross shows nothing". **Rejected:** prose-only intuitive steps.

### D-LAYOUT: compact single-viewport player — RESOLVED

**Decision:** stop the all-vertical stack. **Text left / cube + move-row + controls right**, both
visible without scrolling; the step list becomes a **slim horizontal progress bar** in the header
(instead of a width-eating sidebar). Mobile: tight stack (title → 2–3 lines → cube → controls →
nav). **Rationale:** the 13" scroll pain. **Rejected:** keep stacked + shrink (still scrolls).

> **Adjusted in implementation.** Shipped as a **single vertical stack on all widths**, not the
> two-pane "text left / cube right" — **deliberately**: the two-pane layout left too much empty
> space beside the cube on desktop (the CubeNet isn't tall enough to fill the column). The
> horizontal progress bar landed as planned. The compact intent still stands — the real contract is
> **no _horizontal_ scroll**, with some vertical scroll (clearing the navbar, mobile) tolerated when
> needed, not eliminated at all costs. See the plan's F9 outcome.

### D-RESPONSIVE: fluid CubeNet via container queries — RESOLVED _(first-class concern)_

**Decision:** replace the discrete `size-20/28/36` breakpoints with **one fluid size variable**
(e.g. `--face: min(<cqw>, <cqh>, 9rem)`) driving FaceGrid cells + gaps, using **Tailwind v4
container queries** (`@container`, `cqw`/`cqh`). The cube fits its panel by **width AND height** →
no forced scroll. **CSS only — no JS, no new dependency** (NFR-002). Lives on the **shared**
CubeNet/FaceGrid, so Solver + Timer inherit it (eyeball both). **Why it was painful before:** the
cross is 4-wide × 3-tall with fixed rem sizes fought via media-queries — breakpoints can't "fit a
box". Container queries are the missing tool. **Residual work:** tuning the `clamp`/`min` bounds +
gaps. **Rejected:** JS `ResizeObserver` sizing (heavier, a dependency-shaped path); more breakpoints
(the original trap).

> **Superseded in implementation (2026-06-18).** Container queries did not hold:
> `container-type: size` collapsed inside the flex parent and the `vw` fallback rendered differently
> in Chromium vs Firefox. Shipped **fixed rem per breakpoint**
> (`size-14 sm:size-20 md:size-24 lg:size-28`) — the "more breakpoints" path, which here was the
> correct answer, not the trap. See
> `docs/solutions/2026-06-18-cubenet-cross-browser-sizing-and-mobile-overflow.md` and the plan's F4
> outcome.

### D-ARROWS: arrows + highlighting on the shared CubeNet — RESOLVED

**Decision:** add an optional "active move" / "highlight pieces" capability to the **shared**
CubeNet (SVG/CSS overlay on the relevant face, driven by the current move token). Consumed by Coach
**and** Solver → **closes issue #7**. **Rejected:** a Coach-only overlay (would duplicate for the
Solver issue).

### D-CONTROLS: previous/next only in v1 — RESOLVED

**Decision:** manual prev/next stepping (current `StepControls`); **no auto-play / speed slider** in
v1. **Rationale:** auto-play is **not** free — interval + cleanup on step-change/unmount +
`prefers-reduced-motion` + speed state, all to test. **Rejected:** play/pause/speed now (deferred
follow-up).

### D-DEMO: case-resolver chapters demo case → solved (refines D6) — RESOLVED

**Decision:** **case-resolver** algorithms (White Cross flip, yellow cross, sune, perms) **demo from
the case and play through to solved** — the learner sees it _resolve_. Because the demo **ends
solved**, the "reset your cube" inverse-notation aid is **no longer needed** (it only existed
because D6's solved→forward demo ended scrambled — this dissolves that F4 debt). The `understand`
"recognize the case" step (static, highlighted) shows _when_ to apply it. The one **pure-trigger**
exception is the **sexy move** (White Corners) — keep "watch it shuffle and return 3×" from solved,
_or_ align it to case→solved; **decided at the proof slice**. **Rationale:** for a beginner, "this
case → solved" is the instructive view. **Rejected:** uniform solved→forward for recognition algos
(backwards, less clear); making the learner invert the algo (against the beginner contract).
_Supersedes/refines plan Decision D6 for case-resolver chapters._

### D-STARTSTATE: fixed, known per-chapter cases — RESOLVED

**Decision:** each chapter uses **fixed, known mini-cases** (demo case→solved; practice case→solved,
success by full-state equality — plan D4). **Rejected:** (a) one continuous scramble carried through
all 7 chapters — pedagogically excellent but a much bigger build (running state, varying
recognition, "solved" only at the very end) → a future **"guided full solve" capstone**, not v1; (c)
solver-fed custom scramble — too complex.

### D-WHITECROSS: White Cross gets demo + practice via a promoted real algorithm — RESOLVED

**Decision:** White Cross is **no longer understand-only**. It keeps intuitive matching (most cases)
**and** gains a demo + practice for the "edge oriented wrong" case, using the solver's own
**`FLIPPED_INSERT['UF'] = D R F' R'`**, promoted to the catalog + parity-pinned (like the
second-layer inserts). **Rationale:** a chapter that shows nothing doesn't teach; using the app's
real algorithm keeps "demo = what the solver executes" and stays in the app's white-on-top /
D-staging frame. **Rejected:** copying cubesolve's U-based `U' R U` family — wrong frame
(translation cost, U-vs-D confusion in chapter 1) and a sequence the solver never runs. Chaining
derived variants — neat but too heavy for chapter 1 (mention variants, don't drill them). _Revises
the C2 "intuitive chapters are understand-only" stance._

### D-CATALOG-FINISH: promote the last-layer edge U-perm — RESOLVED

**Decision:** for the "finish" chapter, **promote the real U-perm `[...SUNE, 'D']`** (e.g.
`ua-perm`) to the catalog, parity-pinned to its live solver constant. **Outcome:** all 7 chapters
reference **real, promoted, parity-pinned** algorithms — no invented entries, "demo = solver
executes" everywhere. **Rejected:** an inline `MoveToken[]` (NFR-004); a Coach-only invented perm.

### D-CHAPTERS: 7 chapters, fixed step template — RESOLVED

**Decision:** keep **7 chapters**. Algorithm chapters follow a constant rhythm: **1. Le but**
(`understand` + finished-state visual) → **2. Reconnaître le cas** (`understand` + case visual,
highlighted) → **3. Le mouvement** (`demo`, arrows + notation) → **4. À toi** (`practice`). Two-algo
chapters add a mirrored recognize+move pair and **one** practice. **Rationale:** consistency makes
F5 mechanical to author. **Rejected:** fewer/condensed chapters (less granular for a true beginner).

## Lesson Content — FR drafts (chapters 0–3)

> First drafts to refine during planning — voice and visuals matter more than exact words here.

### Chapitre 0 — Lire le cube _(interactive, before White Cross)_

- **Les 6 faces** — « Avant de résoudre quoi que ce soit, parlons la même langue que le cube.
  Pose-le blanc vers le haut : la face du dessus, c'est **U** (Up). Dessous **D**, devant **F**,
  derrière **B**, à gauche **L**, à droite **R**. » _(faces étiquetées sur le CubeNet, tap pour
  surligner)_
- **Tourner une face** — « Une lettre seule = un quart de tour **horaire** de cette face. Une
  apostrophe `'` inverse le sens. Un `2` = demi-tour. Essaie : touche `R`, puis `R'`. »
  _(tap-pour-tourner)_
- **Un détail sur nos coups** — « Beaucoup de vidéos tournent la face du haut. Nous gardons le blanc
  en haut et tournons **D** (le bas) pour le dernier étage. Même geste, autre lettre — suis les
  coups affichés, tu ne peux pas te perdre. »
- **Aide-mémoire repliable** — rappel compact (6 faces + `'`/`2`) dans chaque leçon.

### Chapitre 1 — La croix blanche

| #   | kind       | Titre                          | Visuel                                          |
| --- | ---------- | ------------------------------ | ----------------------------------------------- |
| 1   | understand | La croix blanche, c'est quoi   | croix finie, arêtes + bandeau couleur surlignés |
| 2   | understand | Le secret : la couleur de côté | **« bonne croix » vs « côtés non alignés »**    |
| 3   | understand | Amener une arête chez elle     | une arête en bas, alignée puis rabattue         |
| 4   | demo       | Quand l'arête est à l'envers   | démo `D R F' R'`, **cas → résolu**, flèches     |
| 5   | practice   | À toi de jouer                 | practice flip-insert                            |

1. « Bienvenue — on commence par le tout début : la **croix blanche**. Quatre arêtes blanches sur la
   face du haut, chacune alignée avec le centre de sa couleur. Bonne nouvelle : ici, presque tout se
   fait à l'œil, sans rien mémoriser. »
2. « Le réflexe qui change tout : chaque arête blanche a une **deuxième couleur**, et c'est elle qui
   commande. Une arête blanc-rouge va sous le centre rouge. Aligne d'abord la couleur de côté avec
   son centre, _ensuite_ rabats-la sur le dessus. Regarde : à gauche une vraie croix, à droite une
   croix qui a _l'air_ bonne mais dont les côtés ne suivent pas — c'est l'erreur classique. »
3. « En pratique : repère une arête blanche, amène-la sous le centre de sa couleur en tournant le
   bas, puis rabats-la d'un demi-tour de la face de côté. Recommence pour les quatre, dans l'ordre
   que tu veux. »
4. « Un seul cas résiste : l'arête est au bon endroit mais le blanc est sur le côté, pas dessus.
   Cette petite séquence la retourne en place — regarde-la se résoudre. »
5. « À ton tour : voici ce cas embêtant. Déroule la séquence et regarde l'arête se remettre droite.
   Quand le cube est résolu, tu as bouclé ta croix. »

### Chapitre 2 — Les coins blancs

| #   | kind       | Titre                     | Visuel                         |
| --- | ---------- | ------------------------- | ------------------------------ |
| 1   | understand | Finir le premier étage    | premier étage complet surligné |
| 2   | understand | Le sexy move              | placer un coin sous sa case    |
| 3   | demo       | Regarde le sexy move agir | démo `sexy-move`, flèches      |
| 4   | practice   | Cale le coin              | practice cas → résolu          |

1. « Ta croix est faite. On complète maintenant tout le premier étage en posant les quatre **coins
   blancs**. Un coin a trois couleurs et va là où ces trois couleurs se rejoignent. »
2. « Voici ton premier vrai algorithme — et le plus important de toute la méthode : le **sexy
   move**, `R' D' R D`. Place un coin blanc dans l'étage du bas, juste sous l'emplacement où il doit
   monter, puis répète le sexy move jusqu'à ce qu'il se loge, blanc vers le haut. C'est tout. »
3. « Regarde-le travailler : le coin est soulevé puis remis en place. Tu le réutiliseras partout,
   alors prends le temps de mémoriser le geste. »
4. « À toi : un coin blanc attend en bas. Déroule le sexy move et regarde-le se caler pendant que le
   cube redevient résolu. »

_(Sexy move = the only pure-trigger algo; demo framing — case→solved vs "shuffle and return 3×" —
decided at the proof slice, per D-DEMO.)_

### Chapitre 3 — Le deuxième étage

| #   | kind       | Titre                      | Visuel                                       |
| --- | ---------- | -------------------------- | -------------------------------------------- |
| 1   | understand | L'étage du milieu          | deux étages faits, arêtes du milieu à placer |
| 2   | demo       | Envoyer une arête à droite | démo `second-layer-insert-right`, cas→résolu |
| 3   | understand | Le miroir, à gauche        | même geste inversé                           |
| 4   | demo       | Envoyer une arête à gauche | démo `second-layer-insert-left`              |
| 5   | practice   | Insère l'arête             | practice insert droit                        |

1. « Beau travail : la face blanche est finie. On remplit maintenant l'**étage du milieu** — les
   quatre arêtes entre le haut et le bas. Tu as déjà tout ce qu'il faut ; ce chapitre, ce sont deux
   mouvements en miroir. »
2. « Quand l'arête doit aller dans la fente en bas à droite, aligne-la sous son centre et déroule
   cette séquence. Regarde-la se glisser sans abîmer la face blanche. »
3. « La fente de gauche, c'est exactement pareil, en miroir : là où la droite part avec `R`, la
   gauche part avec `F`. Si tu sais faire l'une, tu sais déjà l'autre. »
4. « Même idée, inversée. Aligne sous le centre et déroule l'insert gauche. »
5. « À toi : une arête attend en bas. Déroule l'insert droit jusqu'à ce que le cube se referme. »

### Chapters 4–7 (F5) — sketched on the same template

- **Ch4 — La croix jaune** (`yellow-cross-line`, `yellow-cross-l`): recognize dot/L/line, demo each
  case→solved.
- **Ch5 — Orienter les coins** (`sune`, `anti-sune`): make the whole top face yellow.
- **Ch6 — Placer les coins** (`corner-3-cycle`): cycle corners home.
- **Ch7 — Finir** (`ua-perm`, promoted per D-CATALOG-FINISH): permute the last edges → solved.

## Constraints and Boundaries

- **NFR-002:** zero new runtime dependency (responsive is CSS-only; no animation lib for auto-play).
- **NFR-004:** demo/practice reference catalog ids only — never inline `MoveToken[]`.
- **Dependency boundaries:** shared CubeNet stays shared; Coach imports shared + features.
- **Engine touches required:** promote `D R F' R'` (white-cross flip) and `[...SUNE, 'D']` (edge
  U-perm) to the catalog, each with a parity spec — same pattern as the second-layer inserts (D5).
- **Convention deviation:** FR product copy inside an EN-UI app + EN docs — documented, accepted.

## Open Questions

- **White Cross depth:** also demo the easy straight-insert (`F2` family), or only the flip case?
- **Sexy move demo framing:** case→solved vs "shuffle and return 3×" — settle at the proof slice.
- **Ch4 yellow-cross dot case:** present as "apply the algo twice", or its own recognize step?
- Follow-ups (not this scope): auto-play/speed; i18n; the "guided full solve" capstone.

## Out of Scope

- The rest of the app's language (navbar, Solver, Timer stay EN).
- i18n infrastructure; auto-play; the continuous full-solve walkthrough.
- F2L/OLL/PLL content; accounts/sync.

## Next Steps

- `/plan` the **White Cross proof slice** (Chapter 0 primer + compact layout + fluid/arrow CubeNet +
  `D R F' R'` promotion), reviewed on a 13" before propagating.
- Candidate for `/compound`: the container-query approach to the CubeNet (the fix for the April
  responsive pain) once proven.
