
const DEFAULT_REMOTE_TIMEOUT_MS = 60000;

const hasNonEmptyArray = (value) =>
    Array.isArray(value) && value.some((item) => {
        if (typeof item === 'string') return item.trim().length > 0;
        return item && typeof item === 'object' && Object.keys(item).length > 0;
    });

const hasNonEmptyObject = (value) =>
    value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;

const hasSubstantiveAnalysis = (value) => {
    if (!value || typeof value !== 'object') return false;
    if (typeof value.summary === 'string' && value.summary.trim()) return true;
    if (hasNonEmptyArray(value.features) || hasNonEmptyArray(value.suggestions)) return true;
    if (hasNonEmptyArray(value.intents) || hasNonEmptyObject(value.intents)) return true;
    if (hasNonEmptyObject(value.specifications)) return true;
    return typeof value.personaRelevance?.reason === 'string' &&
        value.personaRelevance.reason.trim().length > 0;
};

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
            const substantive = hasSubstantiveAnalysis(remoteResult);
            return {
                ...remoteResult,
                _pipeline: {
                    stage: 'ai',
                    status: substantive ? 'ok' : 'warning',
                    provider: 'ai_primary_worker',
                    warnings: substantive
                        ? []
                        : ['AI provider completed but returned no substantive analysis fields.']
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
