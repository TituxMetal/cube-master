# Plans

Implementation plans for non-trivial work. A plan is the single source of truth for a slice of work
in flight — its checkboxes are the tracker. Produced by `deep-thought:plan`, executed by
`marvin:work`.

## Lifecycle

Each plan carries a `Status:` near the top:

| Status        | Meaning                                                               |
| ------------- | --------------------------------------------------------------------- |
| `approved`    | Agreed, not started                                                   |
| `in_progress` | Actively being executed; checkboxes reflect reality                   |
| `complete`    | All tasks done, shipped, verification green                           |
| `superseded`  | Replaced by a newer plan (link it)                                    |
| `captured`    | Learnings extracted into `docs/solutions/` or an ADR; safe to archive |

## Naming

`YYYY-MM-DD-<kebab-slug>.md` — e.g. `2026-06-15-coach-lesson-browser.md`.

## Rules

- One plan per feature/slice. Keep the plan in step with the work — stale checkboxes are worse than
  none.
- A plan references the relevant ADRs and the `docs/product.md` mode it advances.
- When a plan reaches `complete` or `captured`, leave it here as history; do not delete. Genuinely
  obsolete plans move to `docs/_archive/`.
- Remember the product constraint: plans advance the three modes together — never frame a plan as
  choosing one mode over another. See [../product.md](../product.md).
