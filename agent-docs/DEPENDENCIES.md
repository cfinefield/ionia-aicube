# Dependencies

## Application (Client)
- `three` (`^0.182.0`): 3D rendering and interaction.
- `hammerjs` (`^2.0.8`): Touch gesture recognition.

## Build Tools
- `vite` (overridden to `rolldown-vite@7.2.5`): Fast frontend build tooling.

## Infrastructure
- **Cloudflare Workers**: Hosting for LensCrafter API.
- **Workers AI & Puppeteer**: Server-side processing, AI generation (`gpt-oss-120b`), and web extraction.
- **KV Storage**: Caching layer (`LENS_CACHE`).
