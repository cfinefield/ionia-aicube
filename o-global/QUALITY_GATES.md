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

## Acceptance

Docs are accepted only when all gates pass.

