export const OLLAMA_URL = "http://localhost:11434/api/generate";
export const MODEL_NAME = "qwen3.5:4b";

// Shorter, direct prompt = faster response from local models
const foodJsonPrompt = `You are a nutrition expert. Given a food item, return ONLY a valid JSON object with these exact fields:
{"name":"Food Name","calories":number,"protein":number,"carbs":number,"fats":number,"description":"one line description"}
Be accurate. No markdown. No explanation. No thinking. Just output the raw JSON object and nothing else.`;

const TIMEOUT_MS = 120000; // 120 second timeout for local models

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timeout);
    }
};

/**
 * Cleans up Ollama response text by stripping thinking tags, markdown fences, etc.
 */
const cleanResponse = (raw: string): any => {
    console.log("📝 Raw Ollama response:", raw);

    let cleaned = raw;

    // Strip <think>...</think> blocks (Qwen 3.5 thinking mode)
    cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Strip markdown code fences
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/gi, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    // Try to extract JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            // Validate that required fields exist
            if (parsed.name !== undefined && parsed.calories !== undefined) {
                return parsed;
            }
        } catch (e) {
            console.error("JSON parse error on extracted object:", e);
        }
    }

    // If no JSON object found, try parsing the entire cleaned string
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("Could not parse cleaned response as JSON:", cleaned);
    }

    return null;
};

export const analyzeMacroWithOllama = async (imageBase64: string) => {
    try {
        const response = await fetchWithTimeout(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: foodJsonPrompt,
                images: [imageBase64.split(",")[1]],
                stream: false,
                format: "json"
            })
        }, TIMEOUT_MS);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = cleanResponse(data.response);
        if (result) return result;

        throw new Error("Ollama returned a response but it wasn't valid nutrition JSON. This model may not support image analysis — try 'Ollama (Text)' instead.");

    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error(`Ollama timed out after ${TIMEOUT_MS / 1000}s. Your local model may be too slow. Try a smaller model or ensure GPU acceleration is enabled.`);
        }
        throw new Error(error.message || "Unknown Ollama error");
    }
};

export const analyzeTextWithOllama = async (textQuery: string) => {
    try {
        const prompt = `Estimate the macronutrients for this meal: "${textQuery}".\n${foodJsonPrompt}`;

        const response = await fetchWithTimeout(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false,
                format: "json"
            })
        }, TIMEOUT_MS);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = cleanResponse(data.response);
        if (result) return result;

        throw new Error("Ollama returned a response but it wasn't valid nutrition JSON. Check the browser console for the raw response.");

    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error(`Ollama timed out after ${TIMEOUT_MS / 1000}s. Your local model may be too slow. Try a smaller model or ensure GPU acceleration is enabled.`);
        }
        throw new Error(error.message || "Unknown Ollama error");
    }
};
