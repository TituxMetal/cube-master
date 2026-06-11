# Architecture Decision Records

Short, durable records of decisions that shape the system — the _why_ behind choices that would
otherwise be re-litigated. An ADR is immutable once accepted: to change a decision, write a new ADR
that supersedes the old one (and link both ways).

## Format

`NNNN-kebab-title.md`, numbered in order. Each ADR:

```markdown
# NNNN — Title

**Status:** Accepted | Superseded by NNNN | Proposed **Date:** YYYY-MM-DD

## Context

What forces are at play — the problem, constraints, alternatives considered.

## Decision

What we chose, stated plainly.

## Consequences

What this makes easy, what it makes hard, what we accept as a trade-off.
```

## Index

- [0001 — Hono over Astro for the web server](0001-hono-over-astro.md)
- [0002 — No client-side router library](0002-no-client-side-router.md)
- [0003 — Cube engine as a standalone framework-agnostic package](0003-cube-engine-standalone-package.md)
- [0004 — Layered dependency boundaries](0004-layered-dependency-boundaries.md)
- [0005 — Fly.io via native GitHub deploy](0005-flyio-native-github-deploy.md)
- [0006 — Algorithm catalog in the engine's domain layer](0006-algorithm-catalog-in-domain.md)
