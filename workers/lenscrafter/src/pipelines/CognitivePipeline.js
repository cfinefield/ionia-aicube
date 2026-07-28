
const DEFAULT_REMOTE_TIMEOUT_MS = 25000;
const DEFAULT_BOUND_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';

const ANALYSIS_SCHEMA = {
    type: 'object',
    properties: {
        summary: { type: 'string' },
        features: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 6
        },
        specifications: {
            type: 'object',
            additionalProperties: { type: 'string' }
        },
        intents: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    label: { type: 'string' },
                    score: { type: 'number' }
                },
                required: ['label', 'score']
            },
            maxItems: 6
        },
        personaRelevance: {
            type: 'object',
            properties: {
                features: { type: 'number' },
                price: { type: 'number' },
                reason: { type: 'string' }
            },
            required: ['reason']
        },
        suggestions: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    text: { type: 'string' },
                    priority: {
                        type: 'string',
                        enum: ['high', 'medium', 'low']
                    }
                },
                required: ['text', 'priority']
            },
            maxItems: 6
        }
    },
    required: [
        'summary',
        'features',
        'specifications',
        'intents',
        'personaRelevance',
        'suggestions'
    ]
};

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

const readJsonObject = (value) => {
    if (value && typeof value === 'object') return value;
    if (typeof value !== 'string') {
        throw new Error('Workers AI returned an invalid response.');
    }

    const start = value.indexOf('{');
    const end = value.lastIndexOf('}');
    if (start === -1 || end < start) {
        throw new Error('Workers AI returned no JSON object.');
    }

    return JSON.parse(value.slice(start, end + 1));
};

async function runBoundInference(markdownContent, env, persona) {
    if (!env.AI || typeof env.AI.run !== 'function') {
        throw new Error('Workers AI binding is unavailable.');
    }

    const model = String(env.AI_FALLBACK_MODEL || DEFAULT_BOUND_MODEL).trim();
    const content = String(markdownContent || '').slice(0, 6000);
    const response = await env.AI.run(model, {
        messages: [
            {
                role: 'system',
                content: 'You are the Cognitive Lens of the AI Cube. Analyze only the supplied website evidence. Do not invent facts. Return JSON matching the requested schema.'
            },
            {
                role: 'user',
                content: `Persona: ${persona}\n\nWebsite evidence:\n${content}`
            }
        ],
        response_format: {
            type: 'json_schema',
            json_schema: ANALYSIS_SCHEMA
        },
        max_tokens: 1200,
        temperature: 0.2,
        stream: false
    });

    const parsed = readJsonObject(response?.response ?? response);
    if (!hasSubstantiveAnalysis(parsed)) {
        throw new Error('Workers AI fallback returned no substantive analysis fields.');
    }

    return { result: parsed, model };
}

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
        let remoteFailure = null;

        try {
            const remoteResult = await runRemoteInference(markdownContent, env, persona);
            const substantive = hasSubstantiveAnalysis(remoteResult);
            if (substantive) {
                return {
                    ...remoteResult,
                    _pipeline: {
                        stage: 'ai',
                        status: 'ok',
                        provider: 'ai_primary_worker',
                        warnings: []
                    }
                };
            }

            remoteFailure = new Error('AI provider completed but returned no substantive analysis fields.');
        } catch (e) {
            remoteFailure = e;
        }

        try {
            const fallback = await runBoundInference(markdownContent, env, persona);
            return {
                ...fallback.result,
                _pipeline: {
                    stage: 'ai',
                    status: 'ok',
                    provider: 'workers_ai_binding_fallback',
                    model: fallback.model,
                    warnings: [
                        `Primary provider unavailable: ${String(remoteFailure?.message || remoteFailure)}`
                    ]
                }
            };
        } catch (fallbackError) {
            console.error('CognitivePipeline Error', remoteFailure, fallbackError);

            return {
                features: ['AI Analysis Failed'],
                specifications: {},
                personaRelevance: {
                    reason: `Primary: ${String(remoteFailure?.message || remoteFailure)}; fallback: ${String(fallbackError?.message || fallbackError)}`
                },
                intents: [],
                suggestions: [],
                _pipeline: {
                    stage: 'ai',
                    status: 'error',
                    provider: 'ai_primary_worker+workers_ai_binding_fallback',
                    warnings: [
                        String(remoteFailure?.message || remoteFailure),
                        String(fallbackError?.message || fallbackError)
                    ]
                }
            };
        }
    }
};
