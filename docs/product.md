# CubeMaster — Product

CubeMaster is a Rubik's Cube companion app built around **three modes that coexist and are built
together** — never an either/or. The Solver engine is the backbone: Coach reuses it to demo and
verify algorithms, Timer reuses its scramble generator. One engine, three experiences.

**Primary user:** someone returning to cubing (or starting fresh) who wants a single integrated tool
to go from "I'm stuck" to "I'm getting faster."

> The three modes are first-class and ship together. There is no "pick one" decision and no
> prioritization between them — when planning work, treat all three as part of the product.

## Mode 1 — Solver (signature blue)

Input your cube's current state, receive a step-by-step solution you can follow.

- 2D net input — tap a sticker to paint it with the selected color (centers are fixed)
- Real-time validation — color counts, piece validity, orientation sums, permutation parity
- Layer-by-layer solution across the solver's **5 phases** (White Cross → White Corners → Second
  Layer → Yellow Cross → Yellow Layer)
- Not to be confused with the **7 teaching phases** (White Cross → White Corners → Second Layer →
  Yellow Cross → Yellow Edges → Yellow Corners Position → Yellow Corners Orientation), which
  structure Coach's pedagogical journey — two views over one algorithm catalog, see
  [ADR 0006](adr/0006-algorithm-catalog-in-domain.md)
- Solution view: phase list, prev/next step navigation, cube net reflecting the current step

**Status:** shipped.

## Mode 2 — Coach (signature green)

Progressive tutorials to learn solving methods, using the Solver engine for live demos.

- Lesson browser organized Beginner / Intermediate / Advanced
- Lesson content: explanation + algorithms + cube visualization
- Live demo: show an algorithm's effect on the cube, step by step
- Practice mode: scramble to a specific case, user applies the algorithm
- Content arc: beginner layer-by-layer → intuitive F2L, 2-look OLL/PLL → full OLL/PLL

**Status:** not yet built — the next major piece of the product.

## Mode 3 — Timer (signature red)

A speedcube timer with scrambles and session tracking.

- Scramble generator (random 20–25 moves, WCA-style filtering, deterministic via an injectable
  `Random` contract)
- Start/stop with spacebar (desktop) or tap (mobile), centisecond precision
- Session history with DNF and delete per solve
- Live statistics: Best, Worst, Average of 5, Average of 12 (drop best/worst; DNF rules)
- Persists to localStorage

**Status:** shipped.

## Shared foundation

- **Cube visualization** (`apps/web/src/features/cube/`) — reactive cube state in a nanostore,
  derived stickers, move controls, scramble/reset, move history. The reusable base every mode builds
  on. **Status:** shipped.
- **Cube engine** (`packages/cube-engine/`) — pure TypeScript, framework-agnostic. See
  [architecture.md](architecture.md).

## Ideas held for later

Not scope gates — directions the product can grow into when the three modes are mature:

- Kociemba two-phase optimal solver (the current solver is layer-by-layer)
- 3D cube visualization (today's UI is a 2D net)
- Bluetooth smart-cube integration
- User accounts / cloud sync
- WCA competition mode, inspection timer, multi-session, progression graphs
- Other cube sizes (2×2, 4×4, …)

## Where things live

- Design system and per-mode layouts → [frontend.md](frontend.md)
- Stack, monorepo structure, dependency boundaries → [architecture.md](architecture.md)
- Why the key technical choices were made → [adr/](adr/)
