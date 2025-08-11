export interface FoodItem {
  id: number;
  name: string;
  icon: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  sugar: number;
  imageUrl?: string;
}

export interface DetailedFoodItem extends FoodItem {
  description?: string;
  serving_size?: string;
  ingredients?: string[];
  allergens?: string[];
}

export interface MealFood {
  food: DetailedFoodItem;
  mealType: string;
  addedAt: Date;
  quantity: number;
}

export interface DigestiveTimelineItem {
  id: number;
  name: string;
  category: string;
  digestion: {
    carbs: { duration: number; amount: number };
    protein: { duration: number; amount: number };
    fat: { duration: number; amount: number };
  };
  totalDigestionTime: number;
}

export interface NewFood {
  name: string;
  calories: string;
  carbs: string;
  fat: string;
  protein: string;
} 