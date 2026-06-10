# Solutions

A searchable problem → fix log. When a non-trivial bug, gotcha, or "it finally worked" moment costs
real time, capture it here so the next encounter is a lookup, not a re-investigation. Paired with
`marvin:compound` (which can write these for you after a fix).

## When to add one

- A bug whose root cause was non-obvious
- A config/tooling gotcha (Bun, Turbo, Vite, Fly, Docker, ESLint boundaries)
- A cube-engine subtlety (orientation conventions, parity, scramble quality, solver phase order)

Not for things the code or git history already explains.

## Format

`YYYY-MM-DD-kebab-slug.md`:

```markdown
# <Symptom as you'd search for it>

**Date:** YYYY-MM-DD **Area:** cube-engine | web | build | deploy | tooling

## Symptom

What you saw — the error, the wrong behavior, the surprising output.

## Root cause

Why it actually happened.

## Fix

What resolved it (commands, diffs, the key insight). Link the commit/PR if relevant.

## Prevention

The guard that keeps it fixed — a test, a lint rule, a doc line.
```

Keep the title written the way you'd grep for it months later.
