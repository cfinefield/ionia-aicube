
// import TurndownService from 'turndown';
import * as cheerio from 'cheerio';

export const ContentPipeline = {
    async run(url, env) {
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'LensCrafter/1.0' }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }
            const html = await response.text();
            const $ = cheerio.load(html);

            // 1. Clean "Noise"
            $('.nav, nav, .footer, footer, script, style, .popup, .ad, .advertisement, [role="alert"]').remove();

            // 2. Select Main Content
            // Try semantically appropriate tags first
            let $main = $('main');
            if ($main.length === 0) $main = $('article');
            if ($main.length === 0) $main = $('#main-content');
            if ($main.length === 0) $main = $('body'); // Fallback

            const cleanedHtml = $main.html() || '';

            // 3. Return Cleaned HTML (Skip Markdown conversion to avoid DOM dependency in Worker)
            // Llama 3 handles HTML well.
            return {
                content: cleanedHtml,
                _pipeline: {
                    stage: 'content',
                    status: cleanedHtml.trim() ? 'ok' : 'warning',
                    warnings: cleanedHtml.trim()
                        ? []
                        : ['The page returned no usable main-content HTML.']
                }
            };

        } catch (e) {
            console.error("ContentPipeline Error", e);
            const message = e instanceof Error ? e.message : String(e);
            return {
                content: '',
                _pipeline: {
                    stage: 'content',
                    status: 'error',
                    warnings: [message]
                }
            };
        }
    }
};
