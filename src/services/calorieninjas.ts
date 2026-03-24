// Helper to remove any hidden spaces, invisible characters, or accidental quotes from env variables
const sanitize = (val: any) => {
    if (typeof val !== 'string') return val;
    return val
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove invisible characters
        .replace(/['"]/g, '')                  // Remove accidental quotes
        .trim();                               // Remove leading/trailing whitespace
};

const API_KEY = sanitize(import.meta.env.VITE_CALORIENINJAS_API_KEY);

if (!API_KEY || API_KEY === "your_calorieninjas_api_key_here") {
    console.warn("⚠️ VITE_CALORIENINJAS_API_KEY is missing or using a placeholder in .env");
} else {
    console.log("🥷 Calorie Ninjas API Key Loaded:", `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}`);
}

export const analyzeWithCalorieNinjas = async (query: string) => {
    if (!API_KEY || API_KEY === "your_calorieninjas_api_key_here") {
        throw new Error("Calorie Ninjas API Key is missing. Please add VITE_CALORIENINJAS_API_KEY to your .env file.");
    }

    if (!query || query.trim() === '') {
        throw new Error("Please enter a meal description to analyze.");
    }

    try {
        console.log("🚀 Attempting Calorie Ninjas Analysis for:", query);

        const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Calorie Ninjas API Error: ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            throw new Error("Could not find nutritional information for that description.");
        }

        console.log("✅ Success with Calorie Ninjas API");

        // Aggregate totals for the meal
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        const foodNames: string[] = [];

        data.items.forEach((item: any) => {
            totalCalories += item.calories;
            totalProtein += item.protein_g;
            totalCarbs += item.carbohydrates_total_g;
            totalFats += item.fat_total_g;
            foodNames.push(item.name);
        });

        return {
            name: foodNames.join(', ') || "Custom Meal",
            calories: Math.round(totalCalories) || 0,
            protein: Math.round(totalProtein) || 0,
            carbs: Math.round(totalCarbs) || 0,
            fats: Math.round(totalFats) || 0,
            description: `Analyzed via Calorie Ninjas: ${query}`
        };

    } catch (error: any) {
        console.error("🚨 Calorie Ninjas Error:", error.message);
        throw error;
    }
};
