# CubeMaster — Git Workflow

## Branching

```text
main ← develop ← feature/*, fix/*, hotfix/*
```

- **`main`** — production-ready, always stable
- **`develop`** — integration branch, receives completed work
- **`feature/*`** — one branch per feature (`feature/coach-lesson-browser`)
- **`fix/*`** — bug fixes (`fix/sticker-mapping-orientation`)
- **`hotfix/*`** — urgent fixes applied directly to main (`hotfix/timer-crash`)

**Naming rules:**

- Always full words, never abbreviations: `feature` not `feat`, `fix` not `fx`
- kebab-case after the prefix: `feature/solver-step-navigation`
- Be descriptive: `feature/coach-lesson-browser`, not `feature/coach`

## Commits

- **Conventional commits**: `type(scope): description`
- **Types** (enforced by `@commitlint/config-conventional`): `feat`, `fix`, `refactor`, `test`,
  `docs`, `style`, `chore`, `build`, `ci`, `perf`, `revert`
- **Atomic** — one logical change per commit
- **Imperative mood** — "add timer component", not "added timer component"
- Commit body, when present, lists changed filenames as bullets — no paragraphs, no signatures

> `feat` is a commit _type_ imposed by commitlint. It does **not** mean branches or PR titles use
> `feat` — those always use full words (`feature`).

Run all four checks before committing (see [verification](#verification)).

## Pull requests

- **Required** for merging: `feature/*` → `develop`, `develop` → `main`
- **Assign** the PR to the author
- **Use labels** — create them if missing: `feature`, `fix`, `refactor`, `documentation`; scope
  labels `cube-engine`, `solver`, `coach`, `timer`; status `ready-for-review`, `work-in-progress`
- **Title** — full words, human-facing (`feature`, never `feat`)
- **Description** — summary of changes + test plan

## Merging and sync

- **Rebase merge only** — every commit stays in history, no squash
- Merge and branch deletion are done **manually on GitHub** by the developer
- After merging on GitHub, local sync (when asked):
  1. `git fetch --prune`
  2. delete the local branch that was removed on GitHub
  3. checkout `develop` (or `main` if the merge target was `main`)
  4. pull latest

## History

Keep it clean and linear (rebase, not merge commits). Every commit stays in the log — no squashing.

## Verification

Before every commit, all four must be green:

```bash
bun run format:check
bun run lint:check
bun run typecheck
bun run test
```

Enforced locally by Husky — `pre-commit`: lint-staged · `commit-msg`: commitlint · `pre-push`:
`turbo run typecheck test build`. CI (`.github/workflows/ci.yml`) re-runs the full chain on every
PR/push and pushes Docker images to GHCR on `main`/`develop`.
