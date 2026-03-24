// Helper to sanitize env variables
const sanitize = (val: any) => {
    if (typeof val !== 'string') return val;
    return val.replace(/['"]/g, '').trim();
};

const API_KEY = sanitize(import.meta.env.VITE_DEEPSEEK_API_KEY);

if (!API_KEY) {
    console.warn("⚠️ VITE_DEEPSEEK_API_KEY is missing in .env");
} else {
    console.log("🐋 DeepSeek API Key Loaded:", `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}`);
}

export const analyzeTextWithDeepSeek = async (query: string) => {
    if (!API_KEY) {
        throw new Error("DeepSeek API Key is missing. Please add VITE_DEEPSEEK_API_KEY to your .env file.");
    }

    if (!query || query.trim() === '') {
        throw new Error("Please enter a meal description to analyze.");
    }

    try {
        console.log("🚀 Attempting DeepSeek Analysis for:", query);

        const response = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: `You are a nutrition expert. Analyze the given meal description and estimate its macronutrients.
Return the response strictly in the following JSON format:
{
  "name": "Food Name",
  "calories": 0,
  "protein": 0,
  "carbs": 0,
  "fats": 0,
  "description": "Brief description of the dish."
}

Do not include any markdown formatting like \`\`\`json or text outside the JSON object.`
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                // Attempting to force JSON response format if supported, else rely on prompt
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`DeepSeek API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Try to parse out the JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            console.log("✅ Success with DeepSeek API");
            return JSON.parse(jsonMatch[0]);
        }

        throw new Error("Failed to parse DeepSeek response as JSON.");

    } catch (error: any) {
        console.error("🚨 DeepSeek Error:", error.message);
        throw error;
    }
};
