const API_KEY = (import.meta.env.VITE_CLAUDE_API_KEY || '').trim();

if (!API_KEY || API_KEY === 'your_claude_api_key_here') {
    console.warn("⚠️ VITE_CLAUDE_API_KEY is missing or using a placeholder in .env");
} else {
    console.log("🤖 Claude API Key Loaded:", `${API_KEY.slice(0, 8)}...${API_KEY.slice(-4)}`);
}

const CLAUDE_API_URL = '/anthropic/v1/messages';
const MODEL = 'claude-3-5-sonnet-20241022';

const foodPrompt = `You are a nutrition expert. Analyze the provided food and return ONLY a valid JSON object with these exact fields:
{"name":"Food Name","calories":number,"protein":number,"carbs":number,"fats":number,"description":"brief one-line description"}
Be accurate based on standard nutritional values. No markdown. No explanation. Just the raw JSON object.`;

export const analyzeMacro = async (imageBase64: string) => {
    if (!API_KEY || API_KEY === 'your_claude_api_key_here') {
        throw new Error("Claude API key not configured. Add VITE_CLAUDE_API_KEY to your .env file.");
    }

    try {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 300,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mimeType,
                                    data: base64Data,
                                },
                            },
                            {
                                type: 'text',
                                text: foodPrompt,
                            },
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Claude API error (${response.status}): ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        console.log("🤖 Claude raw response:", text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse nutrition data from Claude response.");

    } catch (error: any) {
        console.error("Claude Image Analysis Failed:", error);
        throw error;
    }
};

export const analyzeText = async (textQuery: string) => {
    if (!API_KEY || API_KEY === 'your_claude_api_key_here') {
        throw new Error("Claude API key not configured. Add VITE_CLAUDE_API_KEY to your .env file.");
    }

    try {
        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 300,
                messages: [
                    {
                        role: 'user',
                        content: `Estimate the macronutrients for this meal: "${textQuery}".\n${foodPrompt}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Claude API error (${response.status}): ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        console.log("🤖 Claude raw response:", text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse nutrition data from Claude response.");

    } catch (error: any) {
        console.error("Claude Text Analysis Failed:", error);
        throw error;
    }
};
