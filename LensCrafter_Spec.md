# LensCrafter: AI Cube Data Extractor Spec

**Architecture:** Cloudflare Worker (Serverless)
**Trigger:** HTTP API (On-demand) or Webhook (from Monibot)
**Output:** AI Cube Knowledge Graph JSON (`productData`)

## Overview
LensCrafter is a specialized extraction service that transforms raw URLs into the multi-dimensional data structure required by the AI Cube. Unlike standard scrapers, it generates 6 distinct "views" (Lenses) of the same content, utilizing both deterministic parsing and probabilistic AI analysis.

## Infrastructure Stack
*   **Runtime:** Cloudflare Workers
*   **Browser Engine:** Cloudflare Browser Rendering API (Puppeteer)
*   **AI:** Workers AI (Llama-3 or similar) or OpenAI API (GPT-4o)
*   **Parser:** `cheerio` (for fast static analysis) + `turndown` (for Markdown)

## API Interface

### `POST /extract`
**Request:**
```json
{
  "url": "https://www.porchandpatiostore.com/item/...",
  "persona": "Entertainer", // Optional: Target persona for relevance scoring
  "options": {
    "render_js": true // Set false for faster, static-only extraction
  }
}
```

**Response:** Returns the full `productData` JSON object (see `KnowledgeGraph.js` schema).

## Extraction Pipeline

The extraction process consists of 4 parallel pipelines, each responsible for specific Lenses.

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
        *   Parse `@type: Product`. Extract `sku`, `price`, `availability`, `brand`.
    *   **Meta Tag Fallback:** If JSON-LD is missing, scrape `og:price:amount`, `product:brand`, etc.
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

---

### 5. The Connectivity Pipeline (Agent Readiness)
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

## Integration with Monibot

While **Monibot** keeps the lights on, **LensCrafter** builds the house.

1.  **Monibot** detects a change diff > 10% on a monitored product page.
2.  **Monibot** fires webhook: `POST /extract { url: "..." }` to LensCrafter.
3.  **LensCrafter** processes the page (approx 5-10s duration).
4.  **LensCrafter** pushes the new `productData` JSON to the Dashboard/Database.
5.  **AI Cube** fetches the latest JSON next time it loads.        c,

## Edge Considerations
*   **Caching:** Store extracted JSON in Cloudflare KV with a TTL (e.g., 24 hours). Avoid re-processing static pages.
*   **Anti-Bot:** Since this runs on Cloudflare, fetching *other* Cloudflare-protected sites might trigger challenges. Use residential proxies if targeting aggressive third-party sites.
*   **Costs:** Heavy on AI calls. Cache aggressively. Only re-extract if `content-hash` changes.
