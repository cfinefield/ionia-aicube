
import puppeteer from '@cloudflare/puppeteer';

export const StructurePipeline = {
    async run(url, env, options = {}) {
        if (!env.BROWSER || !options.render_js) {
            // Fallback or skip if no browser binding
            return {
                nodes: [
                    { role: 'document', label: 'Static Analysis Only (Video/JS Skipped)', bounds: { x: 0, y: 0, w: 0, h: 0 } }
                ],
                msg: "Browser binding missing or render_js=false"
            };
        }

        try {
            // Using standard launch with binding
            const browser = await puppeteer.launch(env.BROWSER);
            const page = await browser.newPage();

            // Set a realistic viewport
            await page.setViewport({ width: 1280, height: 800 });

            await page.setUserAgent('LensCrafter/1.0');
            await page.goto(url, { waitUntil: 'networkidle0' });

            // Extract Semantic Tree
            const snapshot = await page.accessibility.snapshot();

            await browser.close();
            return snapshot;
        } catch (e) {
            console.error("StructurePipeline Error", e);
            return { error: e.message };
        }
    }
};
