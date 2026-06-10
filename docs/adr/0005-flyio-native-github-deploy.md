# 0005 — Fly.io via native GitHub deploy

**Status:** Accepted **Date:** 2026-04-07

## Context

CubeMaster needs a public URL at near-zero cost. The repo already builds a production Docker image
(`docker/Dockerfile.web`, multi-stage, non-root, port 3000) and CI already validates and pushes
images to GHCR. The question was how to deploy without adding a second CI system or a paid always-on
machine.

## Decision

Deploy `apps/web` to **Fly.io** using Fly's **native GitHub integration** (not a GitHub Actions
deploy step). Configuration lives in **`fly-web.toml`** at the repo root:

- region `cdg`, one `shared-cpu-1x` / 256 MB VM
- `auto_stop_machines = "stop"`, `auto_start_machines = true`, `min_machines_running = 0` (zero cost
  when idle, ~1s cold start accepted)
- internal port 3000 → HTTPS, healthcheck `GET /health` every 30s

CI and Fly run independently: CI validates + archives images to GHCR; Fly builds from source on its
own GitHub watcher. The watched branch starts at `develop`, switched to `main` once proven.

## Consequences

- **Easier:** free-tier hosting, no Actions deploy plumbing, a fallback `fly deploy` from local
  always available.
- **Critical gotcha:** the config file is named `fly-web.toml` (non-default) **and** Fly's "Config
  path" must be set to it in the dashboard. Otherwise Fly's scanner regenerates a generic
  `Dockerfile` + `fly.toml` on every push, ignores `[build].dockerfile`, and the monorepo build
  fails. A successful build logs
  `WARN ignoring …/Dockerfile, and using …/docker/Dockerfile.web (from ./fly-web.toml)`.
- **Accepted:** ~1s cold start after idle; bump to `min_machines_running = 1` if unacceptable.
