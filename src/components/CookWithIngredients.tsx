import React, { useState } from 'react';
import {
  Refrigerator,
  Sparkles,
  Plus,
  X,
  RefreshCw,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Meal, UserProfile, FoodPreference } from '../types';
import { MealCard } from './MealCard';

interface CookWithIngredientsProps {
  profile: UserProfile | null;
  preferences: FoodPreference[];
  onCookWithIngredients: (ingredients: string[], notes?: string) => Promise<Meal[]>;
  onOpenMealDetail: (meal: Meal) => void;
  savedMeals: Meal[];
  onSaveToggle: (meal: Meal) => void;
  onAddToPlan: (meal: Meal) => void;
  onAddToGrocery: (meal: Meal) => void;
}

const COMMON_PANTRY_ITEMS = [
  'Eggs',
  'Baby Spinach',
  'Canned Chickpeas',
  'Brown Rice',
  'Chicken Breast',
  'Cherry Tomatoes',
  'Garlic',
  'Pasta',
  'Tofu',
  'Avocado',
  'Lemon',
  'Black Beans',
  'Sweet Potato',
  'Onion',
  'Olive Oil',
  'Feta Cheese',
  'Rolled Oats',
  'Broccoli',
];

export const CookWithIngredients: React.FC<CookWithIngredientsProps> = ({
  profile,
  preferences,
  onCookWithIngredients,
  onOpenMealDetail,
  savedMeals,
  onSaveToggle,
  onAddToPlan,
  onAddToGrocery,
}) => {
  const [ingredients, setIngredients] = useState<string[]>(['Eggs', 'Baby Spinach', 'Cherry Tomatoes']);
  const [inputValue, setInputValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allergyList = preferences.filter((p) => p.preference_type === 'allergy').map((p) => p.food_name);

  const addIngredient = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    if (!ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
    }
    setInputValue('');
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) {
      setErrorMsg('Please add at least one ingredient from your kitchen.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const results = await onCookWithIngredients(ingredients, notes.trim() || undefined);
      setMeals(results);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate meal ideas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-xs border border-white/15">
            <Refrigerator className="w-3.5 h-3.5" />
            <span>Pantry & Fridge Cooking</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2">
            Cook With What You Have
          </h1>
          <p className="text-emerald-100/90 text-xs sm:text-base leading-relaxed mb-4">
            Zero grocery trip required. Enter the ingredients hanging out in your fridge or pantry, and Gemini will generate 2–3 creative, delicious recipes you can make right now.
          </p>

          {allergyList.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/20 text-rose-200 text-xs font-medium border border-rose-400/30">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              AI will strictly exclude your allergens: {allergyList.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Ingredient Builder Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Add Ingredients You Have Available
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="pantry-ingredient-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type an ingredient (e.g. Greek yogurt, zucchini, quinoa) and press Enter..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <button
              id="add-pantry-ingredient-btn"
              onClick={() => addIngredient(inputValue)}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Active Tag Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              Selected Ingredients ({ingredients.length})
            </span>
            {ingredients.length > 0 && (
              <button
                onClick={() => setIngredients([])}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-slate-50 border border-slate-200">
            {ingredients.length === 0 ? (
              <span className="text-xs text-slate-400 italic py-1">
                No ingredients added yet. Pick from common staples below or type your own!
              </span>
            ) : (
              ingredients.map((ing) => (
                <span
                  key={ing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-2xs"
                >
                  <span>{ing}</span>
                  <button
                    onClick={() => removeIngredient(ing)}
                    className="p-0.5 rounded-full hover:bg-emerald-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Quick Add Common Staples */}
        <div>
          <span className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Quick Add Common Staples
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {COMMON_PANTRY_ITEMS.map((item) => {
              const isSelected = ingredients.some((i) => i.toLowerCase() === item.toLowerCase());
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => (isSelected ? removeIngredient(item) : addIngredient(item))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? `✓ ${item}` : `+ ${item}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Preferences or Cooking Style (Optional)
          </label>
          <input
            id="pantry-notes-input"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Under 20 minutes, one-pan only, cozy soup, or high fiber..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex justify-end">
          <button
            id="generate-cook-with-ingredients-btn"
            onClick={handleSearch}
            disabled={isLoading || ingredients.length === 0}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Finding recipes from your ingredients...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate 3 Recipes From My Ingredients</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Screen */}
      {isLoading && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center shadow-md animate-pulse">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-100 text-emerald-800 mb-4 animate-bounce">
            <Refrigerator className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
            Searching for optimal recipes with your pantry items...
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Gemini is combining [{ingredients.slice(0, 4).join(', ')}] into 3 distinct, delicious meals while strictly excluding your allergens.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center justify-between gap-3">
          <span>{errorMsg}</span>
          <button
            onClick={handleSearch}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results Grid */}
      {meals.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              3 Meal Ideas Using Your Ingredients
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Click any recipe to view full cooking instructions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isSaved={savedMeals.some((m) => m.id === meal.id || m.meal_name === meal.meal_name)}
                onSaveToggle={onSaveToggle}
                onOpenDetail={onOpenMealDetail}
                onAddToPlan={onAddToPlan}
                onAddToGrocery={onAddToGrocery}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
