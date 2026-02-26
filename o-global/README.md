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
- `MODULE_PLATFORM_CONTRACT.md`
  - Shared auth/routing/observability contract for all AI Rail modules.
- `MODULE_STARTER_CHECKLIST.md`
  - Step-by-step implementation and deployment checklist per module repo.
- `MODULE_KICKOFF_PROMPT.template.md`
  - Prompt template to hand to each repo-local AI for consistent module setup.

## Repo Role Model

Each repo should declare one role:

- `business-product`
- `platform-tool`
- `shared-infra`
- `experiment`

For `platform-tool` and `shared-infra`, objectives should use enabler KPIs
(adoption, reliability, performance, operability) and map to downstream impact.

## Route Composition Standard

For module repos that plug into AI Rail shell:

- App mount path should be assumed as `/modules/<module-id>`.
- Embed mount path should be assumed as `/modules/<module-id>/embed`.
- Modules must be path-prefix safe (no hard-coded root-relative asset/API links).
- Module docs must capture both direct origin URL and shell-mounted route behavior.
- JWT auth and forwarded request context must be documented for proxied requests.

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
