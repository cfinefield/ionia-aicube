# Deployment Notes

## Production

- Worker name: `lenscrafter`
- Cloudflare account: Ionia OS
- Account ID: `7cd0d72730b1fe58deb55944b9bb0213`
- Public URL: `https://lenscrafter.ionia-cf.workers.dev`
- Module manifest: `https://lenscrafter.ionia-cf.workers.dev/.well-known/airail-module.json`
- Health check: `https://lenscrafter.ionia-cf.workers.dev/health`

## Required Bindings

- `AI`
- `BROWSER`
- `ASSETS`
- `LENS_CACHE`
- `AI_PRIMARY_SERVICE_TOKEN`

## Runtime Variables

- `AI_PRIMARY_BASE_URL`
- `AI_PRIMARY_FALLBACK_TO_LOCAL`

## Notes

The client UI should call `/extract` relative to the current worker origin. Avoid hardcoding historical `ai-rail-account.workers.dev` URLs so the module can remain portable under Ionia-owned or branded hostnames.
