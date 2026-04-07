# Fly.io Deployment — Design

**Date:** 2026-04-07 **Status:** Approved (brainstorming complete) **Scope:** Deploy `apps/web` to
Fly.io with manual-first validation, then native Fly auto-deploy from GitHub.

---

## 1. Goals

- Get `cube-master` running on Fly.io at a public URL.
- Use Fly's native GitHub integration for auto-deploy (no GitHub Actions changes).
- Keep cost at zero (free tier) by leveraging auto-stop machines.
- Add a minimal `/health` endpoint for Fly health checks.

## 2. Non-goals

- No custom domain (deferred — `*.fly.dev` is sufficient for MVP).
- No metrics/observability beyond Fly's defaults.
- No staging/preview environments.
- No changes to `.github/workflows/ci.yml`. The existing CI keeps validating + pushing images to
  GHCR; Fly builds independently from source.
- No backend API service (the project is `apps/web` only — Hono server simply serves the built React
  SPA).

## 3. Architecture

```text
GitHub repo (develop / main)
        │
        │ Fly GitHub integration (configured in Fly dashboard)
        ▼
   Fly.io builder (builds docker/Dockerfile.web)
        │
        ▼
   App "cube-master" — region cdg
   ├─ 1× shared-cpu-1x / 256 MB RAM
   ├─ auto_stop_machines = "stop"
   ├─ auto_start_machines = true
   ├─ min_machines_running = 0
   ├─ internal port 3000 → public HTTPS 443
   └─ healthcheck GET /health
```

CI (`.github/workflows/ci.yml`) and Fly deployment run **in parallel and independently**:

- CI = validation + image archival to GHCR.
- Fly = source build + deploy, triggered by its own GitHub watcher on the configured branch.

## 4. Configuration choices

| Decision      | Value                                               | Rationale                                                                                  |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| App name      | `cube-master` (fallback `cube-master-app` if taken) | Matches repo name                                                                          |
| Region        | `cdg` (Paris)                                       | Closest to user, lowest latency for primary audience                                       |
| VM size       | `shared-cpu-1x`                                     | Free tier eligible                                                                         |
| Memory        | 256 MB                                              | App is lightweight (Bun + Hono serving static SPA, no DB). Bump to 512 MB if OOM observed. |
| Auto-stop     | enabled                                             | Project is low-traffic; ~1s cold start is acceptable                                       |
| Min machines  | 0                                                   | Allows full auto-stop (zero-cost when idle)                                                |
| Force HTTPS   | true                                                | Standard                                                                                   |
| Internal port | 3000                                                | Already set in `Dockerfile.web` (`ENV PORT=3000`)                                          |
| Healthcheck   | `GET /health` every 30s, 5s timeout, 10s grace      | Standard Fly recommendation                                                                |

## 5. Files

### Created

- **`fly-web.toml`** (repo root) Full Fly app configuration. Content:

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

- **`.dockerignore`** (repo root) — only if absent. Excludes `node_modules`, `dist`, `.turbo`,
  `coverage`, `.git`, etc., to speed up Fly's remote build context upload.

- **`apps/web/src/server.spec.ts`** — Bun test for the Hono `app`. Asserts:
  - `GET /health` returns status 200 and JSON `{ status: "ok" }`.
  - Test naming follows project convention (`.spec.ts`, not `.test.ts`).

### Modified

- **`apps/web/src/server.ts`** Two changes:
  1. Add `app.get('/health', (c) => c.json({ status: 'ok' }))` **before** the catch-all
     `app.get('*', ...)` route on line 10. Order matters: the SPA catch-all would otherwise
     intercept `/health`.
  2. Export the `app` instance (`export { app }`) so the spec can import and test it without
     spawning a server.

### Untouched (intentional)

- **`docker/Dockerfile.web`** — already production-ready (multi-stage, non-root, port 3000, ENV vars
  set). No changes needed.
- **`.github/workflows/ci.yml`** — kept as-is. Auto-deploy is handled by Fly's GitHub integration,
  not GitHub Actions.

## 6. Health endpoint

The `/health` endpoint exists solely for Fly's healthcheck. It must:

- Be reachable without authentication.
- Return a 200 status code with a small JSON body.
- Be registered **before** the SPA catch-all route in `server.ts`, otherwise the catch-all serves
  `index.html` and the healthcheck would technically pass but for the wrong reason.

The associated `server.spec.ts` validates both behaviors (status code + JSON body shape) and acts as
a regression guard against accidentally moving the route below the catch-all.

## 7. Deployment procedure

### Phase 1 — Manual validation (one-off)

1. `fly auth login` (if not already authenticated locally).
2. `fly launch --no-deploy --copy-config` from repo root.
   - Fly reads the existing `fly-web.toml` instead of generating a new one.
   - If the name `cube-master` is taken: rename to `cube-master-app` in `fly-web.toml` and re-run.
3. `fly deploy` — first deployment from local CLI.
4. `fly open` — verify the site loads at `https://cube-master.fly.dev/`.
5. Smoke-test routes manually: `/`, `/solver`, `/timer`, `/health`.

### Phase 2 — Native Fly auto-deploy

1. Fly dashboard → app `cube-master` → Settings → connect GitHub repo.
2. **Set "Config path" to `fly-web.toml`.** This is critical: without it, Fly's integration runs its
   scanner on every push, generates a generic `Dockerfile` + `fly.toml` at repo root, ignores
   `[build].dockerfile`, and the build fails on monorepo workspace resolution. The non-default name
   is what makes Fly treat the file as user-owned instead of auto-regenerating it.
3. Configure watched branch = **`develop`** initially (validation phase).
4. On the first push after connecting, Fly creates a one-time branch `flyio-new-files` with its
   auto-generated `Dockerfile` and `fly.toml`. Delete it — it is a bootstrap artifact and subsequent
   deploys correctly use `docker/Dockerfile.web` via `fly-web.toml`'s `[build]` block.
5. Push a small commit to `develop` → confirm Fly triggers a build that logs
   `WARN ignoring /usr/src/app/Dockerfile, and using /usr/src/app/docker/Dockerfile.web (from ./fly-web.toml)`.
6. Once confident, switch the watched branch to **`main`** in the Fly UI.

### Phase 3 — Future (out of scope)

- Custom domain.
- Monitoring/alerting.
- Multi-region.

## 8. Risks & mitigations

| Risk                                             | Likelihood | Mitigation                                                                                   |
| ------------------------------------------------ | ---------- | -------------------------------------------------------------------------------------------- |
| App name `cube-master` already taken             | Medium     | Fallback to `cube-master-app` (or any free name); single edit in `fly-web.toml`.             |
| OOM at 256 MB                                    | Low        | App is static SPA + Hono — minimal runtime footprint. If it happens: `fly scale memory 512`. |
| Fly remote build differs from local Docker build | Low        | Pre-validate locally with `bun run docker:build` (existing script) before `fly deploy`.      |
| `/health` shadowed by SPA catch-all              | Low        | Spec test enforces correct route ordering; catches regression on every CI run.               |
| Cold start ~1s on first request after auto-stop  | Accepted   | Acceptable trade-off for zero-cost idle. If unacceptable later: `min_machines_running = 1`.  |
| Fly's GitHub integration silently stops working  | Low        | Manual `fly deploy` from local always remains as a fallback path.                            |

## 9. Verification strategy

After implementation, the deployment is considered successful when **all** of the following are
true:

- [ ] `fly-web.toml` exists at repo root with the configuration above.
- [ ] `apps/web/src/server.ts` exports `app` and registers `/health` before the catch-all.
- [ ] `apps/web/src/server.spec.ts` exists and passes (`bun run test`).
- [ ] All four checks pass locally: `bun run test`, `bun run typecheck`, `bun run lint:check`,
      `bun run format:check`.
- [ ] Local Docker build succeeds: `bun run docker:build` (or equivalent).
- [ ] `fly deploy` completes without error.
- [ ] `https://cube-master.fly.dev/` (or fallback name) loads the app.
- [ ] `https://cube-master.fly.dev/health` returns `{"status":"ok"}` with 200.
- [ ] Fly dashboard shows the healthcheck as passing.
- [ ] Pushing a commit to `develop` (after Fly GitHub integration is set up) triggers an automatic
      Fly redeploy.

## 10. Out of scope / explicitly deferred

- Backend API on Fly (no API exists yet in this monorepo).
- Database, volumes, secrets (none required for the static SPA).
- Preview environments per PR.
- Blue/green or canary deploys.
- Custom domain (`cube-master.fly.dev` is fine for MVP).
- Adding a Fly deploy step to `ci.yml`.
