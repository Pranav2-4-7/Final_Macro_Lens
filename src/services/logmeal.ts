// Helper to remove any hidden spaces, invisible characters, or accidental quotes from env variables
const sanitize = (val: any) => {
    if (typeof val !== 'string') return val;
    return val
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove invisible characters
        .replace(/['"]/g, '')                  // Remove accidental quotes
        .trim();                               // Remove leading/trailing whitespace
};

const API_KEY = sanitize(import.meta.env.VITE_LOGMEAL_API_KEY);

if (!API_KEY || API_KEY === "your_logmeal_api_key_here") {
    console.warn("⚠️ VITE_LOGMEAL_API_KEY is missing or using a placeholder in .env");
} else {
    console.log("🥘 LogMeal API Key Loaded:", `${API_KEY.slice(0, 6)}...${API_KEY.slice(-4)}`);
}

/**
 * Converts a base64 encoded image to a Blob.
 */
function dataURItoBlob(dataURI: string): Blob {
    // Check if dataURI is undefined or null
    if (!dataURI) {
        throw new Error("Invalid image data");
    }

    // dataURI formats e.g. "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD/..."
    const parts = dataURI.split(',');
    if (parts.length !== 2) {
        throw new Error("Invalid image data format");
    }

    const mimeString = parts[0].split(':')[1].split(';')[0];
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

export const analyzeWithLogMeal = async (imageBase64: string) => {
    if (!API_KEY || API_KEY === "your_logmeal_api_key_here") {
        throw new Error("LogMeal API Key is missing. Please add VITE_LOGMEAL_API_KEY to your .env file.");
    }

    try {
        console.log("🚀 Attempting LogMeal Analysis...");
        const blob = dataURItoBlob(imageBase64);
        const formData = new FormData();
        formData.append('image', blob, 'meal.jpg');

        // Step 1: Send image to segmentation endpoint to get an ID
        const segmentationResponse = await fetch('https://api.logmeal.es/v2/image/segmentation/complete', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!segmentationResponse.ok) {
            const errText = await segmentationResponse.text();
            throw new Error(`LogMeal Segmentation Error: ${segmentationResponse.status} ${segmentationResponse.statusText} - ${errText}`);
        }

        const segmentationData = await segmentationResponse.json();
        const imageId = segmentationData.imageId;

        if (!imageId) {
            throw new Error("Failed to retrieve image ID from LogMeal.");
        }

        // Wait a slight bit to ensure processing
        await new Promise(resolve => setTimeout(resolve, 500));

        // Step 2: Use the image ID to fetch nutritional info
        const nutritionResponse = await fetch('https://api.logmeal.es/v2/recipe/nutritionalInfo', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageId: imageId })
        });

        if (!nutritionResponse.ok) {
            const errText = await nutritionResponse.text();
            throw new Error(`LogMeal Nutrition Info Error: ${nutritionResponse.status} ${nutritionResponse.statusText} - ${errText}`);
        }

        const nutritionData = await nutritionResponse.json();

        console.log("✅ Success with LogMeal API");

        // Step 3: Map LogMeal response format to the app's expected format
        // LogMeal typically returns dailyNutritionalInfo and fullNutritionalInfo
        // Assuming nutritional_info exists based on common API structure.
        const macros = nutritionData.nutritional_info || {};

        let foodName = "Unknown Meal";
        if (segmentationData.segmentation_results && segmentationData.segmentation_results.length > 0) {
            // Find highest probability food item if available
            foodName = segmentationData.segmentation_results[0].recognition_results?.[0]?.name || foodName;
        } else if (nutritionData.foodName && nutritionData.foodName.length > 0) {
            foodName = nutritionData.foodName[0];
        }

        return {
            name: foodName,
            calories: Math.round(macros.calories) || 0,
            protein: Math.round(macros.proteins) || 0, // LogMeal typically uses 'proteins'
            carbs: Math.round(macros.totalCarbs) || Math.round(macros.carbohydrates) || 0,
            fats: Math.round(macros.totalFat) || Math.round(macros.fat) || 0,
            description: "Analyzed via LogMeal API"
        };

    } catch (error: any) {
        console.error("🚨 LogMeal Error:", error.message);
        throw error;
    }
};
