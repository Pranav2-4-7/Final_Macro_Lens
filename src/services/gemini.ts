import { GoogleGenerativeAI, SchemaType, type ResponseSchema } from "@google/generative-ai";

const API_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();

if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
    console.warn("⚠️ VITE_GEMINI_API_KEY is missing or using a placeholder in .env");
} else {
    console.log("💎 Gemini API Key Loaded:", `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}`);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Schema for structured JSON output
const macroSchema = {
    description: "Nutritional macro analysis results",
    type: SchemaType.OBJECT,
    properties: {
        name: { type: SchemaType.STRING },
        calories: { type: SchemaType.NUMBER },
        protein: { type: SchemaType.NUMBER },
        carbs: { type: SchemaType.NUMBER },
        fats: { type: SchemaType.NUMBER },
        description: { type: SchemaType.STRING },
    },
    required: ["name", "calories", "protein", "carbs", "fats", "description"],
} satisfies ResponseSchema;

// Models to try in order
const MODELS_TO_TRY = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
];

// Offline fallback when all models are rate-limited
const offlineFallback = (foodName: string) => ({
    name: foodName || "Unknown Food",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    description: "⚠️ AI is busy (quota exceeded). Please try again in a minute or check your API key billing at ai.google.dev.",
});

export const analyzeMacro = async (imageBase64: string, customDescription?: string) => {
    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`🚀 Attempting Gemini image analysis with: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: macroSchema,
                },
            });

            const prompt = `Analyze this food image and provide accurate nutritional information.
${customDescription ? `The user provided this description of the meal along with the image: "${customDescription}". Please take this into account when identifying the food and estimating its macros.\n` : ""}Return a JSON object with: name (food name), calories, protein (grams), carbs (grams), fats (grams), and description (brief one-line description).
If the image is not food or is unclear, set description to explain why and set all numeric values to 0.`;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64,
                        mimeType: "image/jpeg",
                    },
                },
            ]);

            console.log(`✅ Success with model: ${modelName}`);
            return JSON.parse(result.response.text());
        } catch (error: any) {
            console.warn(`⚠️ Model ${modelName} failed:`, error.message);
            // If it's a 429 quota error, try the next model
            if (error.message?.includes("429")) continue;
            // For non-quota errors on the last model, throw
            if (modelName === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
                throw new Error(error.message || "Failed to analyze image.");
            }
        }
    }

    // All models hit quota — return offline fallback
    console.warn("⚠️ All models rate-limited, using offline fallback");
    return offlineFallback("Uploaded Food");
};

export const analyzeText = async (textQuery: string) => {
    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`🚀 Attempting Gemini text analysis with: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: macroSchema,
                },
            });

            const prompt = `Analyze this meal description: "${textQuery}" and estimate its macronutrients.
Return a JSON object with: name (food name), calories, protein (grams), carbs (grams), fats (grams), and description (brief one-line description).
If the text does not describe food, set description to explain why and set all numeric values to 0.
Be as accurate as possible based on standard nutritional values.`;

            const result = await model.generateContent([prompt]);

            console.log(`✅ Success with model: ${modelName}`);
            return JSON.parse(result.response.text());
        } catch (error: any) {
            console.warn(`⚠️ Model ${modelName} failed:`, error.message);
            if (error.message?.includes("429")) continue;
            if (modelName === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
                throw new Error(error.message || "Failed to analyze text.");
            }
        }
    }

    // All models hit quota — return offline fallback
    console.warn("⚠️ All models rate-limited, using offline fallback");
    return offlineFallback(textQuery);
};
