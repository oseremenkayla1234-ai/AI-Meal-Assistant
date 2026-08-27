export type AgeGroup = 'teens' | '20s' | '30s' | '40s' | '50s' | '60s+';

export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'gluten-free'
  | 'dairy-free'
  | 'low-carb';

export type CookingSkill = 'beginner' | 'intermediate' | 'advanced';

export type BudgetPreference = 'low' | 'medium' | 'high';

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'any';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface MealSubstitution {
  if_missing: string;
  try_instead: string;
}

export interface Meal {
  id: string;
  user_id?: string;
  meal_name: string;
  emoji: string;
  image_url?: string;
  time_minutes: number;
  difficulty: DifficultyLevel;
  nutrition_tags: string[];
  ingredients: string[];
  instructions: string[];
  why_this_meal: string;
  substitutions: MealSubstitution[];
  category?: MealCategory;
  created_at?: string;
}

export interface UserProfile {
  user_id: string;
  age_group: AgeGroup;
  dietary_preference: DietaryPreference;
  cooking_skill: CookingSkill;
  typical_cooking_time: number; // in minutes
  budget_preference: BudgetPreference;
  meal_goals: string[]; // e.g. ["Eat healthier", "High protein", "Quick & easy", "Fiber rich"]
}

export interface FoodPreference {
  id: string;
  user_id: string;
  food_name: string;
  preference_type: 'dislike' | 'allergy'; // strictly distinct!
}

export interface MealPlanEntry {
  id: string;
  user_id: string;
  day_date: string; // YYYY-MM-DD
  meal_slot: MealSlot;
  meal_id?: string | null;
  meal?: Meal;
}

export interface GroceryItem {
  id: string;
  user_id: string;
  item_name: string;
  category: 'produce' | 'protein' | 'dairy' | 'pantry' | 'other';
  checked: boolean;
  source: 'planner' | 'saved' | 'manual';
  created_at?: string;
}

export interface GenerateMealRequest {
  meal_type?: MealCategory;
  available_ingredients?: string[];
  override_time?: number;
  cravings_or_notes?: string;
  custom_goal?: string;
}

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  profile: UserProfile;
  preferences: FoodPreference[];
}

export interface AdminStats {
  totalUsers: number;
  totalMeals: number;
  totalPlanEntries: number;
  totalGroceryItems: number;
  topAllergies: { name: string; count: number }[];
  topDietaryPreferences: { name: string; count: number }[];
  systemHealth: string;
  cacheSize: number;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'tip' | 'alert' | 'update';
}
