# o-global Quality Gates

Use this rubric before accepting kickoff docs.

## Gate 1: Objective Contract

Fail if any primary objective is missing:

- `measurement`
- `target_value`
- `due_date` (absolute date)

## Gate 2: Grounding

Fail if critical claims do not cite evidence references:

- repo paths
- PR URLs
- commit URLs
- issue URLs

## Gate 3: Operational Usefulness

Fail if:

- priorities are generic and not executable
- blockers have no owner
- blockers have no ETA
- decisions needed are missing recommendation

## Gate 4: Unknown Handling

Fail if unknowns are hidden or implied.
All unresolved facts must be explicitly labeled `UNKNOWN`.

## Gate 5: Duplication and Noise

Fail if:

- repeated priorities or duplicate work items exist
- filler content appears (non-actionable prose)

## Gate 6: Repo Role Fit

Fail if repo role is missing or incorrect.

- `business-product` repos should prioritize business metrics.
- `platform-tool` and `shared-infra` repos should prioritize enabler metrics.

## Gate 7: Downstream Impact Mapping

Fail for tool/infra repos if:

- no primary consumers are identified
- no downstream impact commitments are specified
- no measurable impact metric is defined per consumer

## Gate 8: Route and Auth Readiness (Module Repos)

Fail for module repos if:

- shell route mounts are not documented (`/modules/<module-id>` and embed path)
- current route strategy is unclear (`origin`, `proxy`, `edge`, or `dual`)
- auth boundary (JWT vs service auth) is missing or ambiguous
- forwarded request header expectations are not documented

## Acceptance

Docs are accepted only when all gates pass.
