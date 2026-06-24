# Operations Runbook

## Local Development
- Run `npm install` followed by `npm run dev` to start the Vite development server.
- Build production assets using `npm run build`.

## Worker Deployment
- The LensCrafter worker is deployed to Cloudflare via Wrangler.
- Deploy Command: `npm run deploy:worker` (executes `cd workers/lenscrafter && npm install && npm run deploy`).
- Production worker: `https://lenscrafter.ionia-cf.workers.dev`
- Cloudflare account: Ionia OS (`7cd0d72730b1fe58deb55944b9bb0213`)

## Testing & Verification
- Use `npm run preview` to preview the production build locally.
- Test the deployed worker via `curl -X POST https://lenscrafter.ionia-cf.workers.dev/extract` with the appropriate WAF whitelist.
