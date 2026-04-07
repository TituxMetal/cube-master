# Fly.io Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy `apps/web` to Fly.io with a `/health` endpoint, `fly-web.toml` config, and
validation through manual `fly deploy` followed by native Fly GitHub auto-deploy.

**Architecture:** The Hono server in `apps/web/src/server.ts` exposes a new `/health` route before
its SPA catch-all. A new `fly-web.toml` at repo root points Fly to the existing
`docker/Dockerfile.web`. Fly builds and deploys from source; CI stays untouched.

**Tech Stack:** Bun 1.3.10, Hono, Fly.io, Docker, TypeScript.

**Spec reference:** `docs/superpowers/specs/2026-04-07-flyio-deployment-design.md`

**Branch:** `flyio-deployment` (already created, spec already committed as first commit).

---

## File Structure

**Created:**

- `fly-web.toml` (repo root) — Fly app configuration.

**Modified:**

- `apps/web/src/server.ts` — export `app`; register `/health` before catch-all route.
- `apps/web/src/server.spec.ts` — **new file** — Bun test validating the `/health` route.

**Untouched (intentional):**

- `docker/Dockerfile.web` — already production-ready.
- `.dockerignore` — already present at repo root with correct exclusions.
- `.github/workflows/ci.yml` — auto-deploy handled natively by Fly, not by Actions.

---

## Project Conventions Reminder

These rules apply to every task in this plan:

- **No semicolons** in TypeScript.
- **No `function` keyword** — arrow functions only.
- **No default exports** — use named exports (`export { app }`).
- **Test files** use `.spec.ts` suffix, not `.test.ts`.
- **Imports** use the `~/` alias when pointing into `apps/web/src/*`.
- **Commits** follow the repo format: `<type>(<scope>): <subject>` subject line, body as bullets
  listing filenames only, no paragraphs, no signatures.
- **Before every commit**, run all four checks visibly:
  `bun run format:check && bun run lint:check && bun run typecheck && bun run test`.
- **No `bun x` / `npx`** — always `bun run <script>`.

---

## Task 1: Add `/health` endpoint to Hono server (TDD)

**Files:**

- Modify: `apps/web/src/server.ts`
- Create: `apps/web/src/server.spec.ts`

**Context for the engineer:** The current `server.ts` creates a Hono `app`, registers static asset
routes, registers a catch-all `app.get('*', ...)` that serves `index.html`, then calls `serve(...)`
to start the HTTP listener. The `app` instance is **not exported** today, which makes it impossible
to unit-test routes without spawning a real server.

Two changes are needed:

1. Export the `app` instance so the spec can import it and call `app.request(...)` (Hono's built-in
   request handler for testing, which does not need a running server).
2. Register a `GET /health` route that returns `{ status: 'ok' }` — critically, this must be
   **before** the `app.get('*', ...)` catch-all, otherwise the catch-all swallows the path and
   returns `index.html`.

The spec uses `app.request('/health')` — Hono exposes this method on every `Hono` instance; it
returns a standard `Response` object. No HTTP server, no port binding, nothing to clean up.

- [ ] **Step 1.1: Write the failing spec**

Create `apps/web/src/server.spec.ts` with this exact content:

```ts
import { describe, expect, it } from 'bun:test'

import { app } from '~/server'

describe('server', () => {
  describe('GET /health', () => {
    it('returns status 200', async () => {
      const response = await app.request('/health')

      expect(response.status).toBe(200)
    })

    it('returns JSON body { status: "ok" }', async () => {
      const response = await app.request('/health')
      const body = await response.json()

      expect(body).toEqual({ status: 'ok' })
    })

    it('is registered before the SPA catch-all', async () => {
      const response = await app.request('/health')
      const contentType = response.headers.get('content-type') ?? ''

      expect(contentType).toContain('application/json')
    })
  })
})
```

- [ ] **Step 1.2: Run the spec to verify it fails**

Run: `bun run --cwd apps/web test src/server.spec.ts`

Expected: FAIL with an import error along the lines of
`Export named 'app' not found in module '.../server.ts'` — because `server.ts` does not currently
export `app`.

- [ ] **Step 1.3: Update `server.ts` to export `app` and register `/health`**

Replace the full content of `apps/web/src/server.ts` with:

```ts
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'

const app = new Hono()

app.get('/health', c => c.json({ status: 'ok' }))

app.use('/assets/*', serveStatic({ root: './dist' }))
app.use('/favicon.svg', serveStatic({ root: './dist' }))

app.get('*', serveStatic({ root: './dist', path: '/index.html' }))

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, info => {
  console.log(`CubeMaster running at http://localhost:${info.port}`)
})

export { app }
```

Notes:

- `/health` is the **first** route registered so nothing can shadow it.
- `app` is exported at the end as a named export (no default export).
- No semicolons, arrow callback with `c =>` (no `function` keyword).
- The `serve(...)` call still runs at import time — but Hono's `app.request()` in the spec does not
  go through the Node server, so importing `app` in tests will **also** start the server. This is a
  known Bun-test behavior with this file. See Step 1.4 for handling.

- [ ] **Step 1.4: Guard the `serve()` call against test imports**

The previous step's server.ts still calls `serve(...)` at module load, which would start a real HTTP
listener every time the spec imports `app`. Guard it:

Replace the `serve(...)` block in `apps/web/src/server.ts` with:

```ts
if (process.env.NODE_ENV !== 'test') {
  serve({ fetch: app.fetch, port }, info => {
    console.log(`CubeMaster running at http://localhost:${info.port}`)
  })
}
```

Then set `NODE_ENV=test` for the spec run. Bun test already sets `NODE_ENV` to `test` automatically
when running tests, so no extra config is needed — verify by re-running the spec.

If Bun does NOT set `NODE_ENV=test` automatically in your version, add a line at the top of
`apps/web/test-setup.ts`:

```ts
process.env.NODE_ENV = 'test'
```

(Place it before the happy-dom registrator.)

- [ ] **Step 1.5: Run the spec to verify it passes**

Run: `bun run --cwd apps/web test src/server.spec.ts`

Expected: PASS, 3 tests green.

- [ ] **Step 1.6: Run the full test suite to verify no regression**

Run: `bun run test`

Expected: all existing tests still pass, plus the 3 new ones.

- [ ] **Step 1.7: Run all four checks before commit**

Run exactly:

```bash
bun run format:check
bun run lint:check
bun run typecheck
bun run test
```

Expected: all four green. Fix any issue before committing.

- [ ] **Step 1.8: Commit**

```bash
git add apps/web/src/server.ts apps/web/src/server.spec.ts
git commit -m "$(cat <<'EOF'
feat(web): add /health endpoint for fly.io healthchecks

- apps/web/src/server.ts
- apps/web/src/server.spec.ts
EOF
)"
```

Note: if `apps/web/test-setup.ts` was modified in Step 1.4, add it to the same commit.

---

## Task 2: Add `fly-web.toml` configuration

**Files:**

- Create: `fly-web.toml` (repo root)

**Context for the engineer:** `fly-web.toml` is Fly's declarative app config. It tells Fly which
Docker build to use, which region to deploy to, how big the VM should be, and how to run health
checks. Our config:

- Builds from `docker/Dockerfile.web` (multi-stage, already production-ready).
- Runs in `cdg` (Paris).
- Single `shared-cpu-1x` VM with 256 MB RAM.
- `auto_stop_machines = "stop"` — Fly shuts the VM down when idle; `auto_start_machines = true`
  brings it back on the next request.
- `min_machines_running = 0` — zero cost when idle.
- Health check hits `GET /health` every 30s.

- [ ] **Step 2.1: Create `fly-web.toml` at repo root**

Create `fly-web.toml` with this exact content:

```toml
app = "cube-master"
primary_region = "cdg"

[build]
  dockerfile = "docker/Dockerfile.web"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/health"

[[vm]]
  size = "shared-cpu-1x"
  memory = "256mb"
  cpus = 1
```

If the name `cube-master` is already taken (discovered during `fly launch` in Task 3), change the
`app` line to `app = "cube-master-app"` (or any free name) **before** committing — avoid amending
later.

- [ ] **Step 2.2: Validate the Docker build still works locally**

Run: `bun run docker:build`

Expected: the `docker/Dockerfile.web` build succeeds end-to-end. This catches any regression from
Task 1 that only shows up inside the Docker build context (e.g., a missing file in `COPY`).

If it fails, diagnose before continuing — do NOT proceed to `fly deploy` with a broken Docker build.

- [ ] **Step 2.3: Run all four checks before commit**

Run exactly:

```bash
bun run format:check
bun run lint:check
bun run typecheck
bun run test
```

Expected: all four green. `fly-web.toml` is not in scope for prettier (TOML is not formatted by the
repo's prettier config), but format:check must still pass overall.

- [ ] **Step 2.4: Commit**

```bash
git add fly-web.toml
git commit -m "$(cat <<'EOF'
feat: add fly-web.toml for fly.io deployment

- fly-web.toml
EOF
)"
```

---

## Task 3: Manual first deployment (human-in-the-loop)

**Files:** None modified. This task is executed by the user at a terminal; the agent should pause
and hand off.

**Context:** This is the first actual deployment. It runs interactively via the `fly` CLI, which
prompts for confirmations and may need to handle a name collision. An agent cannot complete this
task autonomously — it must be run by the user, and the agent waits for the user's confirmation that
each step succeeded.

- [ ] **Step 3.1: Verify Fly CLI authentication**

User runs: `fly auth whoami`

Expected: prints the user's Fly email. If not authenticated, run `fly auth login` and retry.

- [ ] **Step 3.2: Initialize the Fly app (no deploy yet)**

User runs from repo root: `fly launch --no-deploy --copy-config`

Expected:

- Fly reads the existing `fly-web.toml` and asks to confirm settings.
- Answer: keep the existing config (`Do you want to tweak these settings? No`).
- If Fly says "name already taken", abort, edit `fly-web.toml` → change `app = "cube-master-app"`
  (or another free name), amend Task 2's commit (or add a fixup commit), and re-run.

- [ ] **Step 3.3: Deploy**

User runs: `fly deploy`

Expected:

- Fly uploads the build context.
- Remote build runs `docker/Dockerfile.web` successfully.
- A single machine is created in `cdg`.
- Health check at `/health` passes within the grace period.
- Final output: a URL like `https://cube-master.fly.dev/`.

- [ ] **Step 3.4: Smoke-test the deployment**

User opens the printed URL in a browser and verifies:

- [ ] Home page loads (`/`).
- [ ] Solver page loads (`/solver`).
- [ ] Timer page loads (`/timer`).
- [ ] `curl https://<app>.fly.dev/health` returns `{"status":"ok"}` with HTTP 200.
- [ ] `fly status` shows the machine as healthy.

If any smoke test fails, the agent should investigate before proceeding.

- [ ] **Step 3.5: Set up Fly's native GitHub auto-deploy**

User action (manual, in the Fly web dashboard):

1. Go to <https://fly.io/dashboard> → app `cube-master` → Settings → GitHub.
2. Connect the cube-master GitHub repo.
3. Set the watched branch to **`develop`** (validation phase — NOT `main` yet).
4. Save.

- [ ] **Step 3.6: Validate auto-deploy on `develop`**

Once Task 3 is otherwise complete, the user merges the `flyio-deployment` branch into `develop`
(either locally or via a PR — respecting the project's git-workflow). After the merge, Fly should
automatically trigger a new build and deploy.

User verifies in the Fly dashboard that the build is triggered and succeeds.

- [ ] **Step 3.7: (later, when confident) switch watched branch to `main`**

This is explicitly **deferred**. When the user is satisfied with several successful `develop`
deploys, they change the watched branch in the Fly dashboard from `develop` to `main`. This step is
NOT done as part of this plan's execution.

---

## Task 4: Final verification checklist

**Files:** None. This task is a conscience check before declaring the feature done.

- [ ] `fly-web.toml` exists at repo root with the configuration from Task 2.
- [ ] `apps/web/src/server.ts` exports `app` and registers `/health` before the catch-all.
- [ ] `apps/web/src/server.spec.ts` exists and passes.
- [ ] `bun run format:check` passes.
- [ ] `bun run lint:check` passes.
- [ ] `bun run typecheck` passes.
- [ ] `bun run test` passes, and the new server spec is in the count.
- [ ] `bun run docker:build` succeeds locally.
- [ ] `fly deploy` succeeded and the app is reachable.
- [ ] `https://<app>.fly.dev/health` returns `{"status":"ok"}`.
- [ ] Fly dashboard shows the healthcheck as passing.
- [ ] Fly GitHub integration is connected and watching `develop`.
- [ ] An auto-deploy from a `develop` push has been observed to complete successfully.
- [ ] Spec file `docs/superpowers/specs/2026-04-07-flyio-deployment-design.md` was committed earlier
      on this branch.
- [ ] Branch `flyio-deployment` is ready to be merged via PR (per repo's git-workflow: full-word
      branch name, rebase merge, manual merge on GitHub).

---

## Out of scope (explicitly deferred)

- Custom domain.
- Switching Fly's watched branch to `main` (done later, manually, outside this plan).
- Adding a Fly deploy step to `.github/workflows/ci.yml` (not needed — Fly handles deploy natively).
- Multi-region, blue/green, preview environments.
- Backend API deployment (no API exists in this repo).
