# BRIEF (Kickoff v1)

## Metadata

- project_id: `<project-id>`
- repository: `<owner/repo>`
- repo_role: `business-product|platform-tool|shared-infra|experiment`
- generated_at: `<YYYY-MM-DDTHH:MM:SSZ>`
- generated_by: `<model-or-user>`
- ownership: `o-global`

## Consumers

- primary_consumers:
  - `<downstream business or repo>`
- impact_link: `<how this repo influences downstream outcomes>`

## Executive Summary

- `<5-8 concise lines on what this project is, where it is at, and what matters now>`

## Status

- overall: `green|yellow|red`
- momentum: `rising|flat|declining`
- confidence: `low|medium|high`

## Routing and Auth Readiness (required for module repos)

| area | current_state | target_state | due_date | owner |
| --- | --- | --- | --- | --- |
| `shell_mount` | `<where it runs today>` | `<path-based mount readiness>` | `<YYYY-MM-DD>` | `<owner>` |
| `embed_route` | `<status>` | `<status>` | `<YYYY-MM-DD>` | `<owner>` |
| `auth_contract` | `<status>` | `<status>` | `<YYYY-MM-DD>` | `<owner>` |

## Top Priorities (max 3)

| priority | why_now | measurable_outcome | metric_class | target_value | due_date | owner |
| --- | --- | --- | --- | --- | --- | --- |
| `<priority>` | `<why now>` | `<metric>` | `business|enabler` | `<target>` | `<YYYY-MM-DD>` | `<owner>` |

## Blockers

| blocker | owner | impact | unblock_plan | eta |
| --- | --- | --- | --- | --- |
| `<blocker>` | `<owner>` | `<impact>` | `<plan>` | `<YYYY-MM-DD>` |

## Decisions Needed

| decision | options | recommendation | by_when | owner |
| --- | --- | --- | --- | --- |
| `<decision>` | `<option A/B>` | `<recommended option>` | `<YYYY-MM-DD>` | `<owner>` |

## This Week Plan

| date | action | expected_outcome | verification |
| --- | --- | --- | --- |
| `<YYYY-MM-DD>` | `<action>` | `<result>` | `<how verified>` |

## Downstream Impact Commitments (required for tool/infra repos)

| consumer | expected_change | measurement | target_value | due_date |
| --- | --- | --- | --- | --- |
| `<consumer repo/business>` | `<what improves for consumer>` | `<metric>` | `<target>` | `<YYYY-MM-DD>` |

## Unknowns

- `<UNKNOWN fact that blocks confidence>`

## Validation Checklist

- [ ] No generic aspirational goals.
- [ ] All priorities have metric + target + due date.
- [ ] All blockers have owner + ETA.
- [ ] Unknowns explicitly marked as `UNKNOWN`.
- [ ] Priorities are role-appropriate (`business` vs `enabler` metrics).
- [ ] Tool/infra repos include downstream impact commitments.
- [ ] Module repos include route and auth readiness rows with owners and dates.
