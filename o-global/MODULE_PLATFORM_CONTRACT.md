# AI Rail Module Platform Contract (v1)

Status: active  
Last updated: 2026-02-25  
Owner: o-global

This contract is the shared baseline for all AI Rail modules (`visibility`, `ion-content`, `monibot`, `aicube`, and future modules).

## 1. Goals

Every module must be:

1. Independently deployable.
2. Discoverable by AI Rail shell.
3. Authenticated and authorized using short-lived bearer JWTs.
4. Observable with consistent logs and health signals.
5. Safe to embed in the shell UI.

## 2. Required Routes

Every module must expose:

1. `GET /.well-known/airail-module.json`
2. `GET /health`
3. `GET /embed` (or `/` if embed is root)

Module business APIs can be module-specific, but must be versioned and documented.

## 2A. Route Composition Contract (Path-Based VMFE)

AI Rail shell mounts modules at route prefixes (default: `/modules/<module-id>`).
Modules must work correctly both at direct origin and when proxied under a prefix.

Requirements:

1. Do not assume root path `/` for assets, links, or API calls.
2. Use relative URLs or computed base URLs for in-app fetch/navigation.
3. Support embed render at `/modules/<module-id>/embed` in shell context.
4. Preserve behavior when request headers are forwarded by shell/edge proxy.
5. Do not require iframe-only behavior; route-level rendering should still function.

## 3. Manifest Contract

`/.well-known/airail-module.json` must return JSON:

```json
{
  "id": "visibility",
  "name": "Visibility",
  "description": "AI visibility intelligence for brand mentions, ecosystem links, and submission automation.",
  "app_url": "https://visibility.airail.io",
  "embed_url": "https://visibility.airail.io/embed",
  "health_url": "https://visibility.airail.io/health",
  "api_base_url": "https://visibility.airail.io",
  "version": "0.1.0",
  "auth_mode": "jwt",
  "tags": ["visibility", "analytics", "seo", "agents"]
}
```

Required fields:

- `id` (slug regex: `^[a-z0-9][a-z0-9-_]{1,62}$`)
- `name`
- `description`
- `app_url`
- `health_url`
- `version`
- `auth_mode`
- `tags`

Optional:

- `embed_url`
- `api_base_url`

## 4. Auth and Claims Contract

Protected module endpoints must require:

- `Authorization: Bearer <jwt>`

JWT validation requirements:

1. Verify signature via JWKS.
2. Verify `iss` matches `AIRAIL_JWT_ISSUER`.
3. Verify `aud` contains `AIRAIL_JWT_AUDIENCE`.
4. Verify `exp` and `nbf`.
5. Reject reused/invalid token formats.

Required claims:

- `sub` (user principal)
- `account_id`
- `account_type` (`local_smb` or `saas_brand` unless module allows other values)
- `entitlements` (array)
- `scopes` (array)
- `jti`

Standard status behavior:

1. `401` for missing/invalid token.
2. `403` for valid token but insufficient entitlement/scope.

Local-only bypass is allowed but must be explicit:

- `*_DEV_BYPASS_AUTH=true` only in local dev.
- Never enabled in staging/prod.

## 5. Service-to-Service and Webhooks

Use two auth modes:

1. User-scoped calls: short-lived JWT from AI Rail shell.
2. Non-user automation/webhook calls: dedicated service secret or API key with limited scope.

Rules:

1. Do not use long-lived shared bearer tokens for user-scoped routes.
2. Do not accept unsigned token payload decoding as production auth.

## 6. Headers and Request Context

Shell should forward:

- `Authorization`
- `X-AIRAIL-Request-Id` (UUID)
- `X-AIRAIL-Module-Caller` (shell or module id)
- `X-AIRAIL-Module-Id`
- `X-AIRAIL-Proxy-User-Email` (if available and policy-allowed)

Modules should include `request_id` in logs and error payloads when possible.

## 7. Health Contract

`GET /health` response shape:

```json
{
  "status": "ok",
  "module": "visibility",
  "version": "0.1.0",
  "timestamp": "2026-02-25T00:00:00Z"
}
```

Minimum requirements:

1. Return `200` when ready.
2. Return `503` when critical dependencies are unavailable.
3. Avoid leaking secrets/internal stack traces.

## 8. CORS and Embed Policy

CORS:

1. Restrict origins to AI Rail shell domains in staging/prod.
2. Allow `Authorization` and `Content-Type` headers.

Embedding:

1. `frame-ancestors` must allow shell origins.
2. Do not use wildcard `frame-ancestors` in production.

## 9. Observability Contract

Structured log fields (minimum):

- `timestamp`
- `module_id`
- `env`
- `request_id`
- `route`
- `method`
- `status`
- `duration_ms`
- `account_id` (if available)
- `error_code` (if error)

## 10. Deployment Contract (Cloudflare)

Each module repo must have:

1. `wrangler.toml`
2. Named environments: `staging`, `production`
3. Documented secret list in `agent-docs`
4. Smoke test commands in README

Suggested domain pattern:

- `https://<module>.airail.io` (prod)
- `https://staging-<module>.airail.io` (staging)

## 11. Definition of Done

A module is production-ready only if all pass:

1. Manifest validates in AI Rail `GET /api/modules`.
2. Health endpoint passes.
3. Protected route returns expected `401`, `403`, and `200` behavior.
4. Embed route loads in shell without CSP/frame errors.
5. Logs include `request_id` and status signals.
6. `agent-docs` and `wiki` are updated.
7. `o-global/DOSSIER.md` and `o-global/BRIEF.md` are present.
8. Module is verified as path-prefix safe under `/modules/<module-id>`.
