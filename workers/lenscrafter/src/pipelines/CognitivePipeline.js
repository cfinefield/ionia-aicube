
const DEFAULT_REMOTE_TIMEOUT_MS = 20000;

async function runRemoteInference(markdownContent, env, persona) {
    const baseUrl = String(env.AI_PRIMARY_BASE_URL || '').trim().replace(/\/+$/, '');
    if (!baseUrl) {
        throw new Error('AI_PRIMARY_BASE_URL is required for LensCrafter remote inference.');
    }

    const serviceToken = String(env.AI_PRIMARY_SERVICE_TOKEN || '').trim();
    if (!serviceToken) {
        throw new Error('AI_PRIMARY_SERVICE_TOKEN is required when AI_PRIMARY_BASE_URL is configured.');
    }

    const timeoutMs = Number(env.AI_PRIMARY_TIMEOUT_MS || DEFAULT_REMOTE_TIMEOUT_MS);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(`${baseUrl}/infer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceToken}`
            },
            signal: controller.signal,
            body: JSON.stringify({
                task_type: 'lens_analysis',
                input: {
                    persona,
                    content_html: String(markdownContent || '').slice(0, 6000)
                },
                options: {
                    response_format: 'json'
                }
            })
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            const details = payload && typeof payload === 'object' && payload.details
                ? payload.details
                : `Remote inference failed (${response.status})`;
            throw new Error(String(details));
        }

        if (!payload || typeof payload !== 'object' || !payload.output || typeof payload.output !== 'object') {
            throw new Error('Remote inference returned an invalid payload.');
        }

        return payload.output;
    } finally {
        clearTimeout(timeoutId);
    }
}

export const CognitivePipeline = {
    async run(markdownContent, env, persona = 'General User') {
        try {
            const remoteResult = await runRemoteInference(markdownContent, env, persona);
            return {
                ...remoteResult,
                _pipeline: {
                    stage: 'ai',
                    status: 'ok',
                    provider: 'ai_primary_worker'
                }
            };
        } catch (e) {
            console.error("CognitivePipeline Error", e);

            return {
                features: ["AI Analysis Failed"],
                specifications: {},
                personaRelevance: { reason: "Error: " + e.message },
                intents: [],
                suggestions: [],
                _pipeline: {
                    stage: 'ai',
                    status: 'error',
                    provider: 'ai_primary_worker',
                    warnings: [String(e.message || e)]
                }
            };
        }
    }
};
