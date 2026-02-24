
// import TurndownService from 'turndown';
import * as cheerio from 'cheerio';

export const ContentPipeline = {
    async run(url, env) {
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'LensCrafter/1.0' }
            });
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
            return cleanedHtml;

        } catch (e) {
            console.error("ContentPipeline Error", e);
            return "Error extracting content: " + e.message;
        }
    }
};
