import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const recipeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ingredients_found: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of ingredients identified in the fridge photo.",
    },
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Name of the recipe" },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
          prep_time: { type: Type.STRING, description: "e.g., '15 mins'" },
          calories: { type: Type.NUMBER, description: "Estimated calories per serving" },
          dietary_tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Tags like Vegetarian, Keto, Gluten-Free, etc.",
          },
          ingredients_needed: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                have: { type: Type.BOOLEAN, description: "True if the ingredient is visible in the fridge photo, false otherwise." },
              },
              required: ["name", "have"],
            },
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Step-by-step cooking instructions.",
          },
        },
        required: ["title", "difficulty", "prep_time", "calories", "dietary_tags", "ingredients_needed", "steps"],
      },
      description: "List of 3-5 suggested recipes based on the ingredients found and dietary restrictions.",
    },
  },
  required: ["ingredients_found", "recipes"],
};

export async function analyzeFridge(
  base64Image: string,
  mimeType: string,
  dietaryRestrictions: string[]
): Promise<{ ingredients: string[]; recipes: Recipe[] }> {
  const prompt = `
    Analyze this image of an open fridge.
    1. Identify all visible ingredients.
    2. Suggest 3 to 5 creative and delicious recipes that primarily use these ingredients.
    3. It's okay if some essential ingredients are missing, but mark them as 'have: false'.
    4. Consider the following dietary restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(", ") : "None"}. Ensure the suggested recipes adhere to these restrictions if possible.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const parsed = JSON.parse(text);
    
    // Add unique IDs to recipes
    const recipesWithIds = parsed.recipes.map((r: any) => ({
      ...r,
      id: crypto.randomUUID(),
    }));

    return {
      ingredients: parsed.ingredients_found,
      recipes: recipesWithIds,
    };
  } catch (error) {
    console.error("Error analyzing fridge:", error);
    throw error;
  }
}
