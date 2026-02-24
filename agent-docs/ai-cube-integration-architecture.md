# Implementation Plan: AI Cube Integration

## Goal
Pipe the live `LensCrafter` extraction data (from `airail.io`) into the `AI Cube` visualization, replacing the hardcoded "Sweetwater" / "Porch+Patio" data.

## Challenges
1.  **Hardcoded Lenses**: `BrowserAgentLens.js` currently relies on a hardcoded node list. It ignores the actual `semanticStructure` in the data.
2.  **Schema Mismatch**: The `LensCrafter` JSON format differs slightly from the `KnowledgeGraph.js` internal format.

## Proposed Changes

### 1. Create `src/data/LensCrafterAdapter.js`
A utility to transform `LensCrafter` JSON -> `KnowledgeGraph` Product format.
- Maps `entity`, `commerce`, `features`.
- flattens `semanticStructure` tree into the list format expected by the visualizer.

### 2. Refactor `src/lenses/BrowserAgentLens.js`
- Update `renderHTML` to check for `data.semanticStructure.nodes` (the flattened list) effectively making it dynamic.
- If dynamic data is present, render it. If not, fallback to hardcoded (or legacy behavior).

### 3. Update `src/main.js`
- Add a new "Airail (Live)" button to the product toggle.
- When clicked, load the specific `lenscrafter_output.json` data (imported or fetched) and feed it to the Cube.

## Verification
- Click "Airail (Live)" in the UI.
- Verify "Browser Agent" face shows the *actual* DOM tree of `airail.io`.
- Verify "Crawler Lens" shows the Markdown extracted from `airail.io`.

## Phase 2: MCP Server

### Goal
Allow Claude to trigger site extractions and read the detailed "Agent Thoughts" / "Schema Audit" directly.

### Architecture
- **Server**: **Cloudflare Worker (`lenscrafter`)**.
- **Transport**: HTTP (POST `/mcp/messages`) compliant with MCP spec.
- **Tools**:
    - `extract_site(url: string)`: Calls the internal logic directly.
- **Resources**:
    - `lenscrafter://latest`: Returns the last extraction result (from KV).
    - `lenscrafter://audit`: Returns the text-based Schema Health Check.

### Implementation Steps
1.  **Port Adapter**: Move `LensCrafterAdapter` logic to the Worker (`src/adapter.ts`).
2.  **Add MCP Endpoints**: Implement `POST /mcp/messages` in `worker.js` to handle tool calls.
3.  **Update Config**: Change the Claude desktop config to use `npx -y @modelcontextprotocol/server-cloudflare` (or `mcp-remote` proxy) pointing to the worker.
