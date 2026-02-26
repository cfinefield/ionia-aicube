# DOSSIER (Kickoff v1)

## Metadata

- project_id: `aicube`
- repository: `cfinefield/aicube`
- repo_role: `platform-tool`
- generated_at: `2026-02-25T18:30:00Z`
- generated_by: `codex`
- ownership: `o-global`
- confidence: `medium`

## Consumers and Impact Context

- primary_consumers:
  - `cfinefield/ai-rail-saas-1`
  - `cfinefield/visibility`
  - `cfinefield/ion-content`
- use_case_summary: `Provides site analysis and extraction capabilities used by downstream visibility and content workflows.`
- impact_link: `Higher-quality extraction and module reliability increases signal quality for visibility scoring and article opportunity generation.`

## Objective Contract (Primary)

- measurement: `module_contract_route_coverage`
- target_value: `100% of required module routes (manifest/health/embed) pass shell and direct-origin smoke checks.`
- due_date: `2026-03-05`
- owner: `platform-engineering`
- success_criteria: `Route smoke checks succeed from direct origin and shell-mounted paths with no auth/CSP regressions.`
- metric_class:
  - `business`: `UNKNOWN`
  - `enabler`: `operability`

## Objective Contract (Secondary, optional)

- measurement: `lenscrafter_extraction_success_rate`
- target_value: `>=95% successful extraction responses across first 50 staged requests.`
- due_date: `2026-03-10`
- owner: `aicube-module-owner`
- success_criteria: `50 staged requests complete with valid response schema and no unhandled errors.`
- metric_class: `enabler`

## Current State

- stage: `build`
- status_summary: `
  - Frontend runs as Vite app; LensCrafter runs as Cloudflare Worker.
  - Worker capabilities are present, but module contract route/auth standardization is incomplete.
  - Existing runtime docs indicate manifest/health/embed and shell auth alignment still need hardening.
  - Integration docs for ion-content handoff and system map are present.
  - Deployment and auth boundaries require explicit staging validation.`
- last_major_change: `Module runtime and deploy docs were scaffolded for AI Rail module alignment on 2026-02-25.`
- open_questions:
  - `UNKNOWN: Canonical auth mode split for shell user routes vs internal service routes.`
  - `UNKNOWN: Staging baseline latency targets for LensCrafter extraction.`

## System Surface

- runtime_services:
  - `Vite frontend app`
  - `Cloudflare Worker (workers/lenscrafter)`
- deployment_targets:
  - `local (npm run dev)`
  - `Cloudflare Worker staging (planned)`
  - `Cloudflare Worker production (planned)`
- data_stores:
  - `LENS_CACHE (Cloudflare KV)`
- external_integrations:
  - `Workers AI`
  - `Puppeteer`
  - `AI Rail shell module registry`
  - `ion-content handoff contract`
- shell_route_mounts:
  - app_mount_path: `/modules/aicube`
  - embed_mount_path: `/modules/aicube/embed`
  - route_strategy: `dual`
  - route_readiness: `partial`

## Auth and Access Surface

- user_auth_mode: `mixed`
- service_auth_mode: `api-key`
- required_claims:
  - `UNKNOWN: Pending final JWT claim contract for shell-proxied protected routes.`
- forwarded_headers:
  - `Authorization`
  - `X-AIRAIL-Request-Id`
  - `X-AIRAIL-Module-Caller`
  - `X-AIRAIL-Module-Id`
  - `X-AIRAIL-Proxy-User-Email`
- auth_readiness: `partial`
- auth_unknowns:
  - `UNKNOWN: Which aicube routes must enforce JWT vs API-key-only access.`
  - `UNKNOWN: Issuer/audience values for production claim validation.`

## Risks (Top 5)

| risk | trigger | impact | mitigation | owner | status |
| --- | --- | --- | --- | --- | --- |
| Route contract drift | Module routes differ between direct and shell-mounted paths | Broken module experience in AI Rail | Add route-prefix smoke tests and block release on failures | platform-engineering | open |
| Auth boundary ambiguity | JWT/API key split is undefined | Inconsistent authorization behavior | Publish route-level auth matrix and enforce in middleware | operator | open |
| Extraction reliability variance | Target pages vary in structure and anti-bot posture | Low-confidence downstream signals | Add staged reliability telemetry and fallback classification | aicube-module-owner | watch |
| Latency spikes in dynamic pages | Heavy pages trigger long extraction time | Poor UX and slower downstream workflows | Add timeout budget and p95 monitoring | aicube-module-owner | watch |
| Missing deploy rollback playbook | Runtime issue during rollout | Extended incident duration | Document rollback and run staged dry run | module-ops | open |

## Dependencies

| dependency | type | owner | status | unblock_plan | due_date |
| --- | --- | --- | --- | --- | --- |
| Canonical module auth contract | team | operator | at-risk | Approve JWT/API key split and required claim set | 2026-03-01 |
| Staging deployment target + secrets | infra | operator | at-risk | Configure wrangler envs, secrets, and smoke pipeline | 2026-03-04 |
| Route-prefix proxy validation | infra | platform-engineering | at-risk | Run `/modules/aicube` and `/modules/aicube/embed` validation in shell | 2026-03-05 |

## Consumer Alignment (required for tool/infra repos)

| consumer | dependency_type | value_provided | success_metric | target_value | due_date |
| --- | --- | --- | --- | --- | --- |
| `cfinefield/ai-rail-saas-1` | hard | Stable module open/embed and extraction APIs | `module_contract_route_coverage` | `100%` | 2026-03-05 |
| `cfinefield/visibility` | soft | Structured extraction signals for visibility scoring | `valid_extraction_payload_count` | `>=40 per week` | 2026-03-10 |
| `cfinefield/ion-content` | soft | Content opportunity context and page interpretation inputs | `downstream_handoff_success_rate` | `>=95%` | 2026-03-10 |

## 7-Day Execution Slice

| item | definition_of_done | measurement | target_value | due_date | owner |
| --- | --- | --- | --- | --- | --- |
| Standardize module required routes | Manifest/health/embed pass direct + shell route checks | `module_contract_route_coverage` | `100%` | 2026-03-05 | platform-engineering |
| Finalize auth boundary matrix | All protected routes assigned JWT or API key policy | `auth_boundary_doc_complete` | `true` | 2026-03-01 | operator |
| Establish staged extraction baseline | 50 staged extraction requests logged and scored | `lenscrafter_extraction_success_rate` | `>=95%` | 2026-03-10 | aicube-module-owner |

## Evidence References

- `agent-docs/module-runtime.md`
- `agent-docs/module-deploy.md`
- `agent-docs/ion-content-handoff-contract.md`
- `agent-docs/SYSTEM_MAP.md`
- `wiki/Module Overview.md`
- `wiki/lenscrafter-worker-capabilities.md`
- `workers/lenscrafter/wrangler.toml`
- `README.md`

## Unknowns

- `UNKNOWN: Final production auth claim schema and token issuer/audience values.`
- `UNKNOWN: Target p95 latency SLO for extraction endpoints.`

## Validation Checklist

- [x] All objectives are measurable, quantified, and timed.
- [x] No invented facts.
- [x] Every critical claim has at least one evidence reference.
- [x] Unknowns are explicitly marked as `UNKNOWN`.
- [x] Repo role is declared and objective metrics match repo role.
- [x] Tool/infra repos include explicit downstream consumer alignment.
- [x] Module repos include shell route mounts and auth surface details.
