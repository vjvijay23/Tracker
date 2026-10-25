import { FoodNutritionEstimate } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

/**
 * Sends a base64 encoded food photo to Gemini 1.5 Flash
 * and receives a structured nutrition breakdown in JSON format.
 */
export async function analyzeFoodImage(base64Image: string): Promise<FoodNutritionEstimate> {
  if (!GEMINI_API_KEY) {
    // Graceful fallback for mock/demo mode without API key configured
    return {
      dish_name: 'Grilled Salmon with Quinoa & Steamed Broccoli',
      estimated_weight_g: 350,
      calories: 540,
      protein_g: 44,
      carbs_g: 46,
      fat_g: 16,
      fiber_g: 6.5,
      confidence: 'high',
      health_tips: 'High-protein, heart-healthy Omega-3 meal with complex carbs.',
      ingredients: [
        { name: 'Atlantic Salmon Fillet', weight_g: 170, calories: 290 },
        { name: 'Steamed Quinoa', weight_g: 110, calories: 155 },
        { name: 'Steamed Broccoli', weight_g: 70, calories: 25 },
        { name: 'Olive Oil Drizzle', weight_g: 8, calories: 70 },
      ],
    };
  }

  const prompt = `
You are a precision sports nutrition vision AI. Analyze this meal image:
1. Identify the primary dish and ingredients.
2. Estimate the serving weight in grams.
3. Calculate Calories, Protein (g), Carbohydrates (g), Total Fat (g), and Fiber (g).
Return ONLY a valid JSON object matching this schema:
{
  "dish_name": string,
  "estimated_weight_g": number,
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "confidence": "high" | "medium" | "low",
  "health_tips": string,
  "ingredients": [{ "name": string, "weight_g": number, "calories": number }]
}
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('No response from Gemini Vision');
  }

  return JSON.parse(textResponse) as FoodNutritionEstimate;
}
