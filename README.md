# Ionia AI Cube

AI Cube is the Ionia-hosted LensCrafter worker and interactive analysis UI used by the Ionia module loader.

The production worker is deployed as `lenscrafter` in the Ionia OS Cloudflare account and is exposed at:

- `https://lenscrafter.ionia-cf.workers.dev`
- `https://lenscrafter.ionia-cf.workers.dev/.well-known/airail-module.json`
- `https://lenscrafter.ionia-cf.workers.dev/health`

The worker source lives in `workers/lenscrafter`. The root Vite app builds the UI assets that the worker serves.

## Deploy

```bash
npm install
npm run deploy:worker
```

The worker uses Cloudflare account `7cd0d72730b1fe58deb55944b9bb0213`.

## Guardrail

Do not deploy this worker from the historical `cfinefield/aicube` repo unless it has first been reconciled with this repository. This repo is the canonical Ionia AI Cube source.
