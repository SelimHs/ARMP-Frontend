export interface Recipe {
  id: number;
  title: string;
  image: string;
  summary?: string;
  extendedIngredients?: string[];
  analyzedInstructions?: string[];
  nutrition?: Nutrition;
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}