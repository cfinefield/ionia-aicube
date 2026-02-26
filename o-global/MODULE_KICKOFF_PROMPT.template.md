Use this prompt in each module repo-local AI.

---

You are implementing a production-ready AI Rail module in this repository.

Read these files first:

1. `o-global/MODULE_PLATFORM_CONTRACT.md`
2. `o-global/MODULE_STARTER_CHECKLIST.md`
3. `README.md`
4. `agent-docs/`
5. `wiki/`

Then complete the following:

## A) Runtime and Routes

Implement or verify:

1. `GET /.well-known/airail-module.json`
2. `GET /health`
3. `GET /embed` (or `/` for embed)
4. Protected module API routes (module-specific)
5. Path-prefix safety for `/modules/<module-id>` and `/modules/<module-id>/embed`

## B) Auth

Implement JWT verification middleware for protected endpoints:

1. Verify signature via JWKS.
2. Verify `iss`, `aud`, `exp`, `nbf`.
3. Require `account_id`, `account_type`, entitlements/scopes.
4. Return `401` for invalid token and `403` for insufficient access.
5. Accept forwarded shell context headers and log request id.

Local dev bypass may exist but must be gated by explicit env flag and documented.

## C) Cloudflare Deployment Scaffolding

Ensure:

1. `wrangler.toml` exists with `staging` and `production`.
2. `.dev.vars.example` is present.
3. Secrets are documented, not committed.
4. Local and deploy commands are in README.

## D) Docs

Create or update:

1. `agent-docs/module-runtime.md` (routes, env vars, secrets, auth behavior)
2. `agent-docs/module-deploy.md` (staging/prod deploy, rollback, smoke tests)
3. `wiki/Module Overview.md` (human-readable purpose, capabilities, limits)
4. `o-global/DOSSIER.md` (from `o-global/DOSSIER.template.md`)
5. `o-global/BRIEF.md` (from `o-global/BRIEF.template.md`)
6. Route-composition notes in `agent-docs` (direct origin vs shell-mounted paths)

## E) Quality Rules

1. Do not invent facts.
2. Use absolute dates (`YYYY-MM-DD`).
3. Mark unknowns as `UNKNOWN`.
4. Keep output concise and operational.
5. Every objective must be measurable, quantified, and timed.

## F) Output Format

Return:

1. Summary of files created/updated.
2. Exact env vars required.
3. Exact smoke test commands.
4. Any unresolved `UNKNOWN` items.

---
