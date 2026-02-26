# BRIEF (Kickoff v1)

## Metadata

- project_id: `aicube`
- repository: `cfinefield/aicube`
- repo_role: `platform-tool`
- generated_at: `2026-02-25T18:30:00Z`
- generated_by: `codex`
- ownership: `o-global`

## Consumers

- primary_consumers:
  - `cfinefield/ai-rail-saas-1`
  - `cfinefield/visibility`
  - `cfinefield/ion-content`
- impact_link: `aicube provides extraction and interpretation signals used by downstream visibility ranking and content generation decisions.`

## Executive Summary

- aicube has active frontend + LensCrafter worker foundations.
- Current runtime docs indicate module contract alignment is partial, not complete.
- Highest-value near-term work is route contract hardening and auth boundary clarity.
- Downstream teams need stable extraction reliability and predictable access control.
- This week should focus on module contract completion and baseline extraction telemetry.

## Status

- overall: `yellow`
- momentum: `rising`
- confidence: `medium`

## Routing and Auth Readiness (required for module repos)

| area | current_state | target_state | due_date | owner |
| --- | --- | --- | --- | --- |
| `shell_mount` | Path mount support is partially implemented and not fully validated. | `/modules/aicube` works consistently in direct and proxied contexts. | `2026-03-05` | `platform-engineering` |
| `embed_route` | Embed behavior exists but needs full shell-route smoke coverage. | `/modules/aicube/embed` passes module preview checks in staging. | `2026-03-05` | `platform-engineering` |
| `auth_contract` | Mixed auth behavior exists; route-level policy is not finalized. | JWT/API key boundary documented and enforced for every protected route. | `2026-03-01` | `operator` |

## Top Priorities (max 3)

| priority | why_now | measurable_outcome | metric_class | target_value | due_date | owner |
| --- | --- | --- | --- | --- | --- | --- |
| Complete required module route contract | Needed for stable shell composition and operator trust | `module_contract_route_coverage` | `enabler` | `100%` | `2026-03-05` | `platform-engineering` |
| Finalize and enforce auth boundary | Mixed auth without clear policy increases security and integration risk | `auth_boundary_doc_complete` | `enabler` | `true` | `2026-03-01` | `operator` |
| Establish extraction reliability baseline | Downstream modules require consistent signal quality | `lenscrafter_extraction_success_rate` | `enabler` | `>=95% over 50 requests` | `2026-03-10` | `aicube-module-owner` |

## Blockers

| blocker | owner | impact | unblock_plan | eta |
| --- | --- | --- | --- | --- |
| Canonical auth claim contract not finalized | operator | Blocks consistent route auth enforcement | Publish route-level auth matrix with required claims | 2026-03-01 |
| Staging env and secret readiness incomplete | operator | Delays full smoke validation | Configure wrangler envs and run route/auth checks | 2026-03-04 |

## Decisions Needed

| decision | options | recommendation | by_when | owner |
| --- | --- | --- | --- | --- |
| Auth model for shell-facing protected routes | `api key only` vs `jwt for shell + api key for internal` | `jwt for shell + api key for internal` | `2026-03-01` | `operator` |
| Extraction SLO baseline target | `ad hoc` vs `defined p95 + success baseline` | `defined p95 + success baseline` | `2026-03-05` | `aicube-module-owner` |

## This Week Plan

| date | action | expected_outcome | verification |
| --- | --- | --- | --- |
| `2026-02-27` | Validate route behavior for direct and shell-mounted paths | Module open/embed paths behave consistently | Route smoke checks in shell and direct origin |
| `2026-03-01` | Publish and apply auth boundary matrix | Protected routes use deterministic auth policy | `401/403/200` auth test suite |
| `2026-03-05` | Run baseline extraction reliability sample | Reliability baseline recorded for planning | 50-request staged run report |

## Downstream Impact Commitments (required for tool/infra repos)

| consumer | expected_change | measurement | target_value | due_date |
| --- | --- | --- | --- | --- |
| `cfinefield/ai-rail-saas-1` | More reliable module operation in dashboard | `module_contract_route_coverage` | `100%` | `2026-03-05` |
| `cfinefield/visibility` | Better extraction inputs for ranking opportunities | `valid_extraction_payload_count` | `>=40 weekly` | `2026-03-10` |
| `cfinefield/ion-content` | Fewer handoff failures from extraction outputs | `downstream_handoff_success_rate` | `>=95%` | `2026-03-10` |

## Unknowns

- `UNKNOWN: Final issuer/audience configuration and key rotation policy for JWT validation.`
- `UNKNOWN: Production p95 latency target for extraction-heavy routes.`

## Validation Checklist

- [x] No generic aspirational goals.
- [x] All priorities have metric + target + due date.
- [x] All blockers have owner + ETA.
- [x] Unknowns explicitly marked as `UNKNOWN`.
- [x] Priorities are role-appropriate (`business` vs `enabler` metrics).
- [x] Tool/infra repos include downstream impact commitments.
- [x] Module repos include route and auth readiness rows with owners and dates.
