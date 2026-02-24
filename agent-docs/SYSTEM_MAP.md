# System Map

## Core Components
- **Client Application**: A 3D interactive UI built with `three.js` and `hammerjs`, bundled with `vite`.
- **Lenses**: Modular components (e.g., `ActionLens`, `TransactionLens`) coordinated by the `CubeController` and `DesignManager`.
- **LensCrafter Worker**: A Cloudflare Worker (`lenscrafter`) handling extraction and modification tasks using Puppeteer, Workers AI, and bound to a KV store (`LENS_CACHE`).

## Integrations
- **AI Rail**: Connected via Worker API (`https://airail.io/mcp/messages`) and MCP native protocols.
