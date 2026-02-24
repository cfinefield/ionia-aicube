# o-global Repo Contract Pack

This folder is a reusable contract pack for any project repo that will be monitored by o-global.

Use this pack by copying it into the target repo at:

- `/<repo-root>/o-global/`

The local repo model can generate kickoff content once. After kickoff, o-global should own these files.

## Files

- `DOSSIER.template.md`
  - Stand-alone machine-facing project dossier contract.
- `BRIEF.template.md`
  - Stand-alone operator-facing project brief contract.
- `KICKOFF_REQUEST.template.md`
  - Prompt template to ask a repo-local model to generate kickoff docs.
- `QUALITY_GATES.md`
  - Acceptance gates for doc quality and decision usefulness.

## Ownership Model

- Repo-local model owns:
  - `agent-docs/` (technical operating docs)
  - `wiki/` (human-readable technical docs)
- o-global owns:
  - `o-global/DOSSIER.md`
  - `o-global/BRIEF.md`

## Required Objective Rule

Every objective in dossier/brief must be:

1. Measurable
2. Quantified
3. Timed (absolute date: `YYYY-MM-DD`)

If any field is unknown, write `UNKNOWN` explicitly.

