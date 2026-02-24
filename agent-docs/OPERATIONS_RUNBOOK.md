# Operations Runbook

## Local Development
- Run `npm install` followed by `npm run dev` to start the Vite development server.
- Build production assets using `npm run build`.

## Worker Deployment
- The LensCrafter worker is deployed to Cloudflare via Wrangler.
- Deploy Command: `npm run deploy:worker` (executes `cd workers/lenscrafter && npm install && npm run deploy`).

## Testing & Verification
- Use `npm run preview` to preview the production build locally.
- Test the deployed worker via `curl -X POST https://lenscrafter.ai-rail-account.workers.dev/extract` with the appropriate WAF whitelist.
