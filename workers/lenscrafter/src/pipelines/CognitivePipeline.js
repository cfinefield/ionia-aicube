
export const CognitivePipeline = {
    async run(markdownContent, env, persona = 'General User') {
        if (!env.AI) {
            console.warn("Workers AI binding not found. Skipping Cognitive Pipeline.");
            return { features: [], specifications: {}, personaRelevance: {}, intents: [] };
        }

        try {
            const prompt = `
      You are LensCrafter, an expert product analyst.
      Analyze this product page content for a user with the persona: "${persona}".
      
      Content:
      ${markdownContent.slice(0, 6000)} 
      
      Output JSON only:
      {
        "features": ["Top 4 distinct features"],
        "specifications": { "Key": "Value" },
        "intents": [{ "label": "Purchase", "score": 0.9 }],
        "personaRelevance": { "features": 0.0-1.0, "price": 0.0-1.0, "reason": "Why?" },
        "suggestions": [{ "text": "Suggestion text", "priority": "high|medium|low" }]
      }
      `;

            const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: "system", content: "You represent the Cognitive Lens of the AI Cube. Return valid JSON." },
                    { role: "user", content: prompt }
                ],
                stream: false
            });

            // Simple parsing - in prod we might need to clean markdown code blocks around json
            // Robust JSON extraction
            let jsonStr = response.response;
            const jsonStart = jsonStr.indexOf('{');
            const jsonEnd = jsonStr.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1) {
                jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
            }

            return JSON.parse(jsonStr);

        } catch (e) {
            console.error("CognitivePipeline Error", e);
            return {
                features: ["AI Analysis Failed"],
                specifications: {},
                personaRelevance: { reason: "Error: " + e.message },
                intents: [],
                suggestions: []
            };
        }
    }
};
