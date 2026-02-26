Use this prompt in each repo-local model.

---

You are generating kickoff docs for o-global.

Read these sources first, if they exist:

- `README.md`
- `agent-docs/`
- `wiki/`
- deployment/config files (`Dockerfile`, workflows, infra files)
- recent open PRs/issues (if available)
- module manifest and runtime routing/auth files (if module repo)

Create exactly these files:

1. `o-global/DOSSIER.md`
2. `o-global/BRIEF.md`

Use:

- `o-global/DOSSIER.template.md`
- `o-global/BRIEF.template.md`

Rules:

- Do not invent facts.
- Use absolute dates (`YYYY-MM-DD`).
- Every objective must be measurable, quantified, and timed.
- If unknown, write `UNKNOWN`.
- Include evidence references (paths/PRs/commits/URLs).
- Keep writing concise and operational.
- Declare one repo role:
  - `business-product`
  - `platform-tool`
  - `shared-infra`
  - `experiment`
- For `platform-tool` and `shared-infra` repos:
  - Use enabler KPIs (`adoption`, `reliability`, `performance`, `operability`, `delivery`).
  - Add explicit downstream consumer mappings and impact commitments.
- For module repos:
  - Explicitly document shell mount assumptions (`/modules/<module-id>` and `/modules/<module-id>/embed`).
  - Explicitly document auth boundary and forwarded request headers.

Quality target:

- A human operator should be able to decide the next 7 days of work from these two docs alone.

---
