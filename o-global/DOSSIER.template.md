# DOSSIER (Kickoff v1)

## Metadata

- project_id: `<project-id>`
- repository: `<owner/repo>`
- generated_at: `<YYYY-MM-DDTHH:MM:SSZ>`
- generated_by: `<model-or-user>`
- ownership: `o-global`
- confidence: `low|medium|high`

## Objective Contract (Primary)

- measurement: `<metric_name>`
- target_value: `<numeric or threshold target>`
- due_date: `<YYYY-MM-DD>`
- owner: `<owner role>`
- success_criteria: `<how success is verified>`

## Current State

- stage: `discovery|build|stabilize|scale`
- status_summary: `<current state in 3-6 bullets>`
- last_major_change: `<what changed last and when>`
- open_questions:
  - `<question 1>`
  - `<question 2>`

## System Surface

- runtime_services:
  - `<service>`
- deployment_targets:
  - `<environment>`
- data_stores:
  - `<db/vector store/cache>`
- external_integrations:
  - `<tool/api/repo>`

## Risks (Top 5)

| risk | trigger | impact | mitigation | owner | status |
| --- | --- | --- | --- | --- | --- |
| `<risk>` | `<trigger>` | `<impact>` | `<mitigation>` | `<owner>` | `open|watch|mitigated` |

## Dependencies

| dependency | type | owner | status | unblock_plan | due_date |
| --- | --- | --- | --- | --- | --- |
| `<dependency>` | `repo|tool|team|infra` | `<owner>` | `clear|at-risk|blocked` | `<plan>` | `<YYYY-MM-DD>` |

## 7-Day Execution Slice

| item | definition_of_done | measurement | target_value | due_date | owner |
| --- | --- | --- | --- | --- | --- |
| `<work item>` | `<done criteria>` | `<metric>` | `<target>` | `<YYYY-MM-DD>` | `<owner>` |

## Evidence References

- `<path/to/file>`
- `<pull-request-url>`
- `<commit-url>`
- `<issue-url>`

## Unknowns

- `<UNKNOWN fact that must be resolved>`

## Validation Checklist

- [ ] All objectives are measurable, quantified, and timed.
- [ ] No invented facts.
- [ ] Every critical claim has at least one evidence reference.
- [ ] Unknowns are explicitly marked as `UNKNOWN`.

