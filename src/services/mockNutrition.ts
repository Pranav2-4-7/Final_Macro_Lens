/**
 * Mock Nutrition Service
 * Provides simulated nutritional data to bypass external API dependency errors.
 */

const commonFoods: Record<string, { calories: number, protein: number, carbs: number, fats: number }> = {
    "egg": { calories: 70, protein: 6, carbs: 0, fats: 5 },
    "eggs": { calories: 140, protein: 12, carbs: 0, fats: 10 },
    "bread": { calories: 80, protein: 3, carbs: 15, fats: 1 },
    "toast": { calories: 80, protein: 3, carbs: 15, fats: 1 },
    "chicken": { calories: 165, protein: 31, carbs: 0, fats: 4 },
    "rice": { calories: 200, protein: 4, carbs: 45, fats: 0 },
    "banana": { calories: 105, protein: 1, carbs: 27, fats: 0 },
    "apple": { calories: 95, protein: 0, carbs: 25, fats: 0 },
    "oatmeal": { calories: 150, protein: 5, carbs: 27, fats: 3 },
    "peanut butter": { calories: 190, protein: 7, carbs: 6, fats: 16 },
    "coffee": { calories: 2, protein: 0, carbs: 0, fats: 0 },
    "milk": { calories: 120, protein: 8, carbs: 12, fats: 5 },
    "pizza": { calories: 285, protein: 12, carbs: 36, fats: 10 },
    "burger": { calories: 350, protein: 20, carbs: 30, fats: 15 },
    "salad": { calories: 100, protein: 2, carbs: 10, fats: 6 }
};

export const analyzeWithSimulator = async (query: string) => {
    // Artificial delay to simulate "processing"
    await new Promise(resolve => setTimeout(resolve, 1200));

    const lowerQuery = query.toLowerCase();
    let totals = { calories: 0, protein: 0, carbs: 0, fats: 0, items: [] as string[] };

    // Simple keyword matching for common foods
    Object.keys(commonFoods).forEach(food => {
        if (lowerQuery.includes(food)) {
            const data = commonFoods[food];
            totals.calories += data.calories;
            totals.protein += data.protein;
            totals.carbs += data.carbs;
            totals.fats += data.fats;
            totals.items.push(food);
        }
    });

    // Fallback if no keywords matched
    if (totals.items.length === 0) {
        // Generate pseudo-random realistic values for unknown entries
        const seed = query.length;
        return {
            name: query.split(' ').slice(0, 3).join(' ') || "Custom Meal",
            calories: 150 + (seed % 200),
            protein: 5 + (seed % 15),
            carbs: 10 + (seed % 30),
            fats: 5 + (seed % 10),
            description: "Analyzed via Local Simulator (Simulated results based on your description)."
        };
    }

    return {
        name: totals.items.map(i => i.charAt(0).toUpperCase() + i.slice(1)).join(' & '),
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
        description: `Analyzed via Local Simulator: Matches found for ${totals.items.join(', ')}.`
    };
};
