# DOSSIER (Kickoff v1)

## Metadata

- project_id: `<project-id>`
- repository: `<owner/repo>`
- repo_role: `business-product|platform-tool|shared-infra|experiment`
- generated_at: `<YYYY-MM-DDTHH:MM:SSZ>`
- generated_by: `<model-or-user>`
- ownership: `o-global`
- confidence: `low|medium|high`

## Consumers and Impact Context

- primary_consumers:
  - `<downstream business or repo>`
- use_case_summary: `<what consumers rely on this repo for>`
- impact_link: `<how this repo affects downstream business outcomes>`

## Objective Contract (Primary)

- measurement: `<metric_name>`
- target_value: `<numeric or threshold target>`
- due_date: `<YYYY-MM-DD>`
- owner: `<owner role>`
- success_criteria: `<how success is verified>`
- metric_class:
  - `business`: `<revenue|activation|retention|conversion|cost>`
  - `enabler`: `<adoption|reliability|performance|operability|delivery>`

## Objective Contract (Secondary, optional)

- measurement: `<metric_name>`
- target_value: `<numeric or threshold target>`
- due_date: `<YYYY-MM-DD>`
- owner: `<owner role>`
- success_criteria: `<how success is verified>`
- metric_class: `<business|enabler>`

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
- shell_route_mounts:
  - app_mount_path: `</modules/<module-id> or UNKNOWN>`
  - embed_mount_path: `</modules/<module-id>/embed or UNKNOWN>`
  - route_strategy: `origin-only|shell-proxy|edge-router|dual`
  - route_readiness: `not_started|partial|ready`

## Auth and Access Surface

- user_auth_mode: `jwt|api_key|mixed|UNKNOWN`
- service_auth_mode: `service-secret|api-key|none|UNKNOWN`
- required_claims:
  - `<claim name>`
- forwarded_headers:
  - `Authorization`
  - `X-AIRAIL-Request-Id`
  - `X-AIRAIL-Module-Caller`
  - `<any additional header>`
- auth_readiness: `not_started|partial|ready`
- auth_unknowns:
  - `<UNKNOWN auth detail>`

## Risks (Top 5)

| risk | trigger | impact | mitigation | owner | status |
| --- | --- | --- | --- | --- | --- |
| `<risk>` | `<trigger>` | `<impact>` | `<mitigation>` | `<owner>` | `open|watch|mitigated` |

## Dependencies

| dependency | type | owner | status | unblock_plan | due_date |
| --- | --- | --- | --- | --- | --- |
| `<dependency>` | `repo|tool|team|infra` | `<owner>` | `clear|at-risk|blocked` | `<plan>` | `<YYYY-MM-DD>` |

## Consumer Alignment (required for tool/infra repos)

| consumer | dependency_type | value_provided | success_metric | target_value | due_date |
| --- | --- | --- | --- | --- | --- |
| `<consumer repo/business>` | `hard|soft` | `<what value this repo provides>` | `<metric>` | `<target>` | `<YYYY-MM-DD>` |

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
- [ ] Repo role is declared and objective metrics match repo role.
- [ ] Tool/infra repos include explicit downstream consumer alignment.
- [ ] Module repos include shell route mounts and auth surface details.
