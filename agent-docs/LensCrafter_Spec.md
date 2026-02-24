# LensCrafter: AI Cube Data Extractor Spec

**Architecture:** Cloudflare Worker (Serverless)
**Trigger:** HTTP API (On-demand) or Webhook (from Monibot)
**Destinations (Storage):** AI Rail Platform (Cloudflare KV + D1)
**Primary Clients (Consumers):** AI Cube (Visual), MCP Server (Interactive)
**Output:** Knowledge Graph JSON (`entityData`)


## Overview
LensCrafter is a specialized extraction service that transforms raw URLs into the multi-dimensional data structure required by the AI Cube. Unlike standard scrapers, it generates 6 distinct "views" (Lenses) of the same content, utilizing both deterministic parsing and probabilistic AI analysis.

## Infrastructure Stack
*   **Runtime:** Cloudflare Workers
*   **Browser Engine:** Cloudflare Browser Rendering API (Puppeteer)
*   **AI:** Workers AI (`gpt-oss-120b`)
*   **Parser:** `cheerio` (for fast static analysis) + `turndown` (for Markdown)
*   **Adapters:** `octokit` (GitHub), `sanity` (CMS), `postgres` (Database)
*   **Storage (Managed Mode):** AI Rail Platform (Cloudflare KV + D1 + Vectorize)

## Operational Modes

| Feature | **Audit Mode** | **Managed Mode** |
| :--- | :--- | :--- |
| **Goal** | Visual Inspection & Health Check | Active "Mission Control" & Management |
| **Trigger** | Manual (One-off) | Continuous (Monibot) or Admin User |
| **Storage** | Ephemeral / Cache-only | **AI Rail Platform** (Persistent KV/D1) |
| **Write-Back** | Disabled | Enabled (`POST /patch`) |
| **Use Case** | Sales Demos, Initial Scans | Client Site Management |

## API Interface

### `POST /extract`
**Request:**
```json
{
  "url": "https://www.porchandpatiostore.com/item/...",
  "mode": "audit" | "managed", // Default: "audit"
  "persona": "Entertainer",
  "options": {
    "render_js": true
  }
}
```


**Response:** Returns the full `entityData` JSON object.
*   **Audit Mode:** Calculated on-the-fly.
*   **Managed Mode:** Fetched from AI Rail Platform (if fresh) or calculated & stored.

### `POST /patch` (The Optimization Loop)
*Requires `mode: managed`*

**Request:**
```json
{
  "url": "https://www.porchandpatiostore.com/item/...",
  "instructions": "Update the price to $49.99 and fix the brand name.",
  "target_layer": "json-ld" | "cms-content" | "meta-tags",
  "auth_context": { ... } // Adapter-specific credentials
}
```

**Response:**
```json
{
  "status": "success",
  "action": "pull_request",
  "ref": "https://github.com/org/repo/pull/123",
  "diff": "..."
}
```

## Extraction & Generation Pipelines

The system consists of 5 pipelines: 4 for reading (Extraction) and 1 for writing (Generation).

### 1. The Structure Pipeline (Browser Agent Lens)
*   **Goal:** Build the semantic DOM tree.
*   **Tools:** Puppeteer (Browser Rendering)
*   **Logic:**
    *   Load page, wait for network idle.
    *   **Landmark detection:** Identify `header`, `nav`, `main`, `footer` bounding boxes.
    *   **Interactive Element Map:** Scan all `button`, `a`, `input`.
        *   Extract `aria-label`, visible text, and `onclick` listeners.
        *   Heuristic: If `onclick` or `href` contains "cart", label as "Purchase Action".
    *   **Output:** Simplified DOM tree JSON with `role` and `label` attributes.

### 2. The Data Pipeline (Transaction Lens)
*   **Goal:** precise, deterministic commercial data.
*   **Tools:** `cheerio` (static HTML parsing)
*   **Logic:**
    *   **JSON-LD Extraction:** Hunt for `<script type="application/ld+json">`.
        *   Parse `@type`: Supports `Product`, `Service`, `Event`, `Article`, `Organization`.
        *   Extract core fields (`name`, `description`, `offers`, `date`).
    *   **Meta Tag Fallback:** If JSON-LD is missing, scrape `og:title`, `og:description`, etc.
    *   **Output:** `entity`, `commerce`, and `intents` objects (Purchase actions are deterministic here).

### 3. The Content Pipeline (Crawler Lens)
*   **Goal:** Clean, token-efficient knowledge for LLMs.
*   **Tools:** `turndown` + Custom Regex
*   **Logic:**
    *   Select `#main-content` or `article`.
    *   Remove "noise" selectors: `.nav`, `.footer`, `.popup`, `.advertisement`.
    *   Convert HTML -> Markdown.
    *   **Table Processing:** Convert HTML tables to Markdown tables (crucial for Specs).
    *   **Output:** `crawler.markdown` string.

### 4. The Cognitive Pipeline (Persona & Action Lenses)
*   **Goal:** Subjective scoring and intent discovery.
*   **Tools:** LLM (Workers AI / OpenAI)
*   **Input:** The Markdown from Pipeline 3.
*   **Prompt:**
    ```text
    Analyze this product page for a user with the persona: "{persona}".
    1. Extract the top 4 distinct features.
    2. Extract technical specifications into Key-Value pairs.
    3. Identify actionable intents (Purchase, Delivery, Support).
    4. For each section (Features, Specs, Price), assign a Relevance Score (0-1.0)
    based on how important it is for a "{persona}".
    Explain WHY it is relevant.
    ```
*   **Output:** `features` array, `specifications` object, `personaRelevance` map, and enriched `intents`.

### 5. The Generator Pipeline (Write-Back)
*   **Goal:** Execute the "Optimization Loop" by applying changes to the source.
*   **Tools:** `codemod` engines, integration adapters.
*   **Logic:**
    1.  **Diff Analysis:** Compare `current_state` (Extraction) vs `desired_state` (User Input).
    2.  **Strategy Selection:**
        *   *Structured Data:* If JSON-LD, generate a JSON patch.
        *   *Content:* If text/markdown, generate a copy-edit suggestion.
        *   *Code:* If functionality, generate a React prop update (if applicable).
    3.  **Adapter Execution:**
        *   **Git Adapter:** Clone -> Branch -> Patch -> Commit -> PR.
        *   **CMS Adapter:** API Call to update field (`PATCH /api/products/:id`).
        *   **Local Adapter:** Return valid code block for User to copy-paste.

---

### 6. The Connectivity Pipeline (Agent Readiness)
*   **Goal:** Validate readiness for major agentic platforms.
*   **Output:** Status flags for UCP, ACP, MCP, and Amazon.
*   **Logic:**
    1.  **Google (UCP):**
        *   Check for `/.well-known/ucp` manifest (Status 200).
        *   Scan for JSON-LD with `ucp:capability` or `actionPlatform`.
    2.  **OpenAI & Stripe (ACP):**
        *   Check for `agentic-commerce` namespace in meta tags.
        *   Look for `/.well-known/agent-plugin.json` or Stripe Agent headers.
    3.  **Anthropic (MCP):**
        *   Check for `/.well-known/llms.txt` or `/llms.txt`.
        *   Validate reference to MCP Server endpoint.
    4.  **Amazon (Buy with Prime):**
        *   Detect `buy-with-prime.js` in DOM scripts.

---

## Data Schema Mapping

| AI Cube Field | Source Pipeline | Method |
| :--- | :--- | :--- |
| `entity.name` | Data | JSON-LD / `og:title` |
| `entity.image` | Data | `og:image` |
| `commerce.price` | Data | JSON-LD / `product:price:amount` |
| `features` | Cognitive | LLM extraction from Markdown |
| `specifications` | Content + Cognitive | Markdown Table -> JSON conversion |
| `semanticStructure` | Structure | Puppeteer Accessibility Tree |
| `intents` | Structure + Cognitive | Merged valid buttons + LLM inferred goals |
| `personaRelevance` | Cognitive | LLM Scoring of content sections |

## Integration with Monibot & AI Rail

*   **Read (Monibot):** Detects changes, fires `POST /extract`, pushes new data to AI Cube.
*   **Write (AI Rail):** User inspects "Agent Lens", spots issue, fires `POST /patch`.
    *   LensCrafter validates the patch.
    *   LensCrafter commits the fix to the repo/CMS.
    *   Monibot picks up the change on next deploy/publish, closing the loop.

## Edge Considerations
*   **Caching:** Store extracted JSON in Cloudflare KV with a TTL (e.g., 24 hours). Avoid re-processing static pages.
*   **Anti-Bot:** Since this runs on Cloudflare, fetching *other* Cloudflare-protected sites might trigger challenges. Use residential proxies if targeting aggressive third-party sites.
*   **Costs:** Heavy on AI calls. Cache aggressively. Only re-extract if `content-hash` changes.
*   **Security:** `POST /patch` requires strong authentication (OAuth/PAT) to prevent unauthorized defacement.
