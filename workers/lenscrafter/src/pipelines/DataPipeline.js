
import * as cheerio from 'cheerio';

export const DataPipeline = {
    async run(url, env) {
        try {
            // 1. Fetch HTML (Server-side fetch, separate from Puppeteer for speed)
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'LensCrafter/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // 2. Extract JSON-LD
            let jsonLd = {};
            $('script[type="application/ld+json"]').each((i, el) => {
                try {
                    const data = JSON.parse($(el).html());
                    // Prioritize Product, Service, Event, Article
                    const type = data['@type'];
                    if (['Product', 'Service', 'Event', 'Article', 'Organization'].includes(type)) {
                        jsonLd = { ...jsonLd, ...data };
                    }
                } catch (e) {
                    console.error('JSON-LD Parse Error', e);
                }
            });

            // 3. Extract Open Graph / Meta Fallbacks
            const meta = {
                title: $('meta[property="og:title"]').attr('content') || $('title').text(),
                description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
                image: $('meta[property="og:image"]').attr('content'),
                brand: $('meta[property="product:brand"]').attr('content'),
                price: $('meta[property="product:price:amount"]').attr('content') || $('meta[property="og:price:amount"]').attr('content'),
                currency: $('meta[property="product:price:currency"]').attr('content') || $('meta[property="og:price:currency"]').attr('content') || 'USD',
            };

            // 4. Normalize Data
            const entity = {
                name: jsonLd.name || meta.title,
                description: jsonLd.description || meta.description,
                image: jsonLd.image || meta.image,
                type: jsonLd['@type'] || 'Thing',
                url: url
            };

            const commerce = {
                price: jsonLd.offers?.price || meta.price,
                currency: jsonLd.offers?.priceCurrency || meta.currency,
                availability: jsonLd.offers?.availability || 'Unknown',
                brand: jsonLd.brand?.name || meta.brand
            };

            return {
                entity,
                commerce,
                intents: [], // To be populated by cognitive/structure pipelines
                _pipeline: {
                    stage: 'fetch',
                    status: 'ok',
                    httpStatus: response.status
                }
            };

        } catch (e) {
            console.error('DataPipeline Error', e);
            const message = e instanceof Error ? e.message : String(e);
            return {
                entity: { name: 'Error fetching content', error: message },
                commerce: {},
                intents: [],
                _pipeline: {
                    stage: 'fetch',
                    status: 'error',
                    warnings: [message]
                }
            };
        }
    }
};
