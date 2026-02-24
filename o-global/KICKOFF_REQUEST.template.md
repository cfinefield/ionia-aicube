Use this prompt in each repo-local model.

---

You are generating kickoff docs for o-global.

Read these sources first, if they exist:

- `README.md`
- `agent-docs/`
- `wiki/`
- deployment/config files (`Dockerfile`, workflows, infra files)
- recent open PRs/issues (if available)

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

Quality target:

- A human operator should be able to decide the next 7 days of work from these two docs alone.

---

