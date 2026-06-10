# AGENTS.md Standard

The root `AGENTS.md` is the operating map for this repo. It is a **map, not a dump**: it routes to
the right doc for each task instead of restating their contents. These checks define what a healthy
`AGENTS.md` commits to. Re-run them whenever `AGENTS.md` or the docs it points to change.

| #   | Check                        | PASS when…                                                                                                                      |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Mission first**            | The three coexisting modes (Solver/Coach/Timer) are stated up top, framed as built-together — never an either/or.               |
| 2   | **No mode either/or**        | Nothing in the file implies choosing among, or prioritizing between, the three modes.                                           |
| 3   | **Map not dump**             | ≤ ~180 lines; routes to `docs/*` rather than copying their contents.                                                            |
| 4   | **Repo map**                 | `apps/web`, `packages/cube-engine`, and shared packages are located with one line each.                                         |
| 5   | **Read-first routing**       | A task→doc table points to `product`, `architecture`, `frontend`, `git-workflow`, `adr/`, `plans/`, `solutions/`.               |
| 6   | **House rules present**      | Code conventions are stated: no semicolons, arrow-only, named exports only, `.spec.ts`, `~/` alias, `bun run` (never npx/bunx). |
| 7   | **Dependency boundaries**    | The shared → feature → pages import rules are named (or routed to architecture.md).                                             |
| 8   | **Verification is concrete** | The four checks (`format:check`, `lint:check`, `typecheck`, `test`) + `build` are listed as the gate.                           |
| 9   | **Done is defined**          | "Done" = four checks + build green + conventional commit + PR into `develop`.                                                   |
| 10  | **Links resolve**            | Every relative link in `AGENTS.md` points to a file that exists.                                                                |
| 11  | **Archive marked**           | `docs/_archive/` is flagged as reference-only / superseded.                                                                     |
| 12  | **First-time setup**         | A clone-and-go section covers `bun install` and the project-scoped plugins.                                                     |

## How to use

- After editing `AGENTS.md`, walk the table top to bottom; any FAIL is a fix-now.
- `cc-lab:cc-lab-diagnose` (project mode) cross-checks these same commitments against repo reality.
- Keep this list in sync with what `AGENTS.md` actually promises — if the doctrine grows a new
  commitment, add a check here.
