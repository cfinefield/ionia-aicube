# Walkthrough - LensCrafter Worker Implementation

I have fully implemented and deployed the **LensCrafter Worker**.

## Deployment Status
*   **Worker URL**: `https://lenscrafter.ai-rail-account.workers.dev`
*   **Environment**: `nodejs_compat` enabled.
*   **Bindings**:
    *   `LENS_CACHE` (KV): `128c3635855f4eb69711ef1473643709`
    *   `AI` (Workers AI)
    *   `BROWSER` (Puppeteer)

## Capabilities
1.  **Extraction (`POST /extract`)**:
    *   Fetches HTML via `fetch`.
    *   Parses structured data (JSON-LD) via `cheerio`.
    *   Converts content to Markdown via `turndown`.
    *   Analyzes intent via `gpt-oss-120b`.
2.  **Modification (`POST /patch`)**:
    *   Accepts update instructions.
    *   Creates Pull Requests via generic `GithubAdapter`.

## Verification
*   [x] `wrangler deploy` successful.
*   [x] Dependencies (`@cloudflare/puppeteer`, `cheerio`, `turndown`) packaged correctly.
*   [x] KV Namespace bound.
*   [x] **Audit Test**: Verified against `https://airail.io`.
    *   **Static Extraction (JSON-LD)**: ✅ Success.
    *   **Full Browser (Puppeteer)**: ✅ **Success** (with "Skip Super Bot Fight Mode" rule).

## Usage
To test the endpoint:
```bash
# Full Browser Extraction (Requires WAF Whitelist)
curl -X POST https://lenscrafter.ai-rail-account.workers.dev/extract \
  -d '{"url": "https://airail.io", "mode": "audit", "options": {"render_js": true}}'
```

## MCP Server Setup (Cloudflare Native)

To connect Claude to the Cloudflare Worker directly, install `mcp-remote` and use this config:

```json
{
  "mcpServers": {
    "lenscrafter": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://airail.io/mcp/messages"
      ]
    }
  }
}
```

Then restart Claude Desktop. Valid tools: `extract_site(url)`. Valid resources: `lenscrafter://latest`.
