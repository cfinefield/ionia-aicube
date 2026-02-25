# DOSSIER (Kickoff v1)

## Metadata

- project_id: `aicube`
- repository: `cfinefield/aicube`
- repo_role: `platform/tool`
- primary_consumers: `general generative UI workflows, AI Rail agents`
- generated_at: `2026-02-24T22:23:14Z`
- generated_by: `Antigravity`
- ownership: `o-global`
- confidence: `high`

## Objective Contract (Enabler KPIs)

- measurement: `Active connected Lenses deployments`
- target_value: `10`
- due_date: `2026-04-01`
- owner: `Antigravity`
- success_criteria: `10 unique Lenses deployed. Downstream Impact: Broadens generative AI ecosystem adoption across different workflows.`

- measurement: `LensCrafter extraction success rate`
- target_value: `99.9%`
- due_date: `2026-03-15`
- owner: `Antigravity`
- success_criteria: `Endpoint reliably extracts JSON-LD/HTML. Downstream Impact: Reduces "AI hallucination" support tickets resulting from bad context.`

- measurement: `LensCrafter extraction latency P95 (ms)`
- target_value: `2000`
- due_date: `2026-05-01`
- owner: `UNKNOWN`
- success_criteria: `Under 2000ms query resolution. Downstream Impact: Drastically improves real-time perceived performance in browser UI.`

- measurement: `Time to create and deploy new Lens (hours)`
- target_value: `24`
- due_date: `2026-04-15`
- owner: `UNKNOWN`
- success_criteria: `Devs can build and push a Lens <24h. Downstream Impact: Shorter feature delivery delays for dependent business teams.`

## Current State

- stage: `build`
- status_summary:
  - Deployed `lenscrafter` as a platform utility parsing agent content.
  - Active frontend tool integration enabling the `CubeController` engine.
  - Preparing for scale to multiple independent business case deployments.
- last_major_change: `Implemented LensCrafter Worker (wiki/lenscrafter-worker-capabilities.md)`
- open_questions:
  - `UNKNOWN: What are the current baseline latencies for the LensCrafter worker?`
  - `UNKNOWN: Who assumes organizational ownership over Lens integration tooling?`

## System Surface

- runtime_services:
  - `Vite Development Server`
  - `LensCrafter Worker`
- deployment_targets:
  - `Cloudflare Workers (nodejs_compat)`
- data_stores:
  - `LENS_CACHE (Cloudflare KV)`
- external_integrations:
  - `Workers AI`
  - `Puppeteer`
  - `https://airail.io/mcp/messages`

## Risks (Top 5)

| risk | trigger | impact | mitigation | owner | status |
| --- | --- | --- | --- | --- | --- |
| `Latency Spikes` | `Deep web extractions block worker` | `Browser UI freezes during calls` | `UNKNOWN` | `UNKNOWN` | `open` |
| `Data Quality` | `Dynamic SPAs prevent pure fetch parsing` | `AI receives empty models` | `Puppeteer fallback with bot bypass` | `Antigravity` | `mitigated` |
| `Integration Friction` | `Lens API is undocumented` | `New business tools take weeks to merge` | `Create standard Lens setup script` | `UNKNOWN` | `open` |
| `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `open` |
| `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `UNKNOWN` | `open` |

## Dependencies

| dependency | type | owner | status | unblock_plan | due_date |
| --- | --- | --- | --- | --- | --- |
| `Cloudflare Workers` | `infra` | `UNKNOWN` | `clear` | `UNKNOWN` | `2026-12-31` |
| `Workers AI` | `tool` | `UNKNOWN` | `clear` | `UNKNOWN` | `2026-12-31` |
| `three.js` | `tool` | `UNKNOWN` | `clear` | `UNKNOWN` | `2026-12-31` |

## 7-Day Execution Slice

| item | definition_of_done | measurement | target_value | due_date | owner |
| --- | --- | --- | --- | --- | --- |
| `Gather Baseline Metrics` | `Implement / query worker logs for P95 latency` | `Defined KPI baselines` | `1` | `2026-03-03` | `Antigravity` |

## Evidence References

- `package.json`
- `wiki/lenscrafter-worker-capabilities.md`
- `o-global/QUALITY_GATES.md`

## Unknowns

- `UNKNOWN: Current extraction latency baseline metrics`
- `UNKNOWN: Tooling adoption owner mapping`
- `UNKNOWN: Future risk triggers for deep UI integrations`

## Validation Checklist

- [x] All objectives are measurable, quantified, and timed.
- [x] No invented facts.
- [x] Every critical claim has at least one evidence reference.
- [x] Unknowns are explicitly marked as `UNKNOWN`.
