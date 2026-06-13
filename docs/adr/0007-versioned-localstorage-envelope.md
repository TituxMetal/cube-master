# 0007 — Versioned localStorage envelope in the shared layer

**Status:** Proposed **Date:** 2026-06-13

## Context

The Timer persists `cubeMaster:solves` as a bare array with no schema version
(`features/timer/stores/sessionStore.ts`) — a documented footgun: the day its shape changes, old
stored data either crashes a naive `JSON.parse` or silently coerces into a mismatched type. Coach
adds a second persisted store (`cubeMaster:coachProgress`) and must not repeat that mistake.

Promoting persistence into a shared, versioned helper is a deliberate decision beyond the
brainstorm's "versioned localStorage" note: it is the seam through which the Timer is later migrated
off its unversioned store. The helper is therefore plumbing Coach needs _and_ the migration path the
Timer will take.

## Decision

Introduce a shared `{ version, data }` localStorage helper in `apps/web/src/lib/`. It reads and
writes a versioned envelope to a given key:

- **Write** wraps the payload as `{ version, data }` and stores it; writes are best-effort and
  swallow exceptions (quota, private mode) so a full or disabled `localStorage` degrades to
  in-memory rather than crashing.
- **Read** returns a supplied default on a missing key, malformed JSON, or a `version` that does not
  match the current one — it never throws to the caller and never coerces a mismatched shape into
  typed state.
- **Last-write-wins** across tabs (no locking) — acceptable for this app.

Coach persists `cubeMaster:coachProgress` at version 1 from day one. The helper lives in the
`shared` layer and imports only shared.

## Consequences

- **Easier:** Coach progress is migration-ready from the first commit; every future persisted store
  carries a schema version for free.
- **Endorsed follow-up:** the Timer **is not migrated in v1** (no-refactor non-goal), but migrating
  `cubeMaster:solves` onto this helper is an endorsed, tracked post-v1 task — the ADR is justified
  partly to enable it, not merely as Coach plumbing. Recorded as plan Follow-Up F1.
- **Harder / accepted:** a tiny shared module to own and test, versus inline per-store persistence.

## Alternatives considered

- **Per-store hand-rolled persistence** (what the Timer does today) — rejected: repeats the
  unversioned footgun for every new store.
- **A storage library** (e.g. `idb-keyval`, `zustand/persist`) — rejected: violates NFR-002 (zero
  new runtime dependencies) for a `{ version, data }` envelope that is a dozen tested lines.
