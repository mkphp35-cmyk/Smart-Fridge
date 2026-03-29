export interface Ingredient {
  name: string;
  have: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prep_time: string;
  calories: number;
  dietary_tags: string[];
  ingredients_needed: Ingredient[];
  steps: string[];
  image_prompt?: string; // For future use if we want to generate images
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export type DietaryRestriction = 
  | "Vegetarian" 
  | "Vegan" 
  | "Keto" 
  | "Paleo" 
  | "Gluten-Free" 
  | "Dairy-Free" 
  | "Nut-Free";
