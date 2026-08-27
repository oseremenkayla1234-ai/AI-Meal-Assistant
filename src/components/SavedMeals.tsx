import React, { useState } from 'react';
import { Bookmark, Search, Filter, Clock, Sparkles } from 'lucide-react';
import { Meal } from '../types';
import { MealCard } from './MealCard';

interface SavedMealsProps {
  savedMeals: Meal[];
  onOpenMealDetail: (meal: Meal) => void;
  onSaveToggle: (meal: Meal) => void;
  onAddToPlan: (meal: Meal) => void;
  onAddToGrocery: (meal: Meal) => void;
  onNavigateToGenerate: () => void;
}

export const SavedMeals: React.FC<SavedMealsProps> = ({
  savedMeals,
  onOpenMealDetail,
  onSaveToggle,
  onAddToPlan,
  onAddToGrocery,
  onNavigateToGenerate,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');

  const filteredMeals = savedMeals.filter((meal) => {
    const matchesQuery =
      meal.meal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase())) ||
      meal.nutrition_tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      difficultyFilter === 'all' || meal.difficulty === difficultyFilter;

    return matchesQuery && matchesDifficulty;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Recipe Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Saved Meals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Your personal collection of favorite AI-generated and curated recipes.
          </p>
        </div>

        <button
          onClick={onNavigateToGenerate}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Discover New Meal</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-saved-meals"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved recipes, ingredients, or tags (e.g. spinach, protein)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                difficultyFilter === diff
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {diff === 'all' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* Meals Grid */}
      {filteredMeals.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            {savedMeals.length === 0 ? 'No saved meals yet' : 'No matching meals found'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
            {savedMeals.length === 0
              ? 'Click the bookmark icon on any recipe to save it here for fast weekly meal planning!'
              : 'Try clearing your search query or adjusting difficulty filters.'}
          </p>
          {savedMeals.length === 0 && (
            <button
              onClick={onNavigateToGenerate}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              Generate a Personalized Meal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              isSaved={true}
              onSaveToggle={onSaveToggle}
              onOpenDetail={onOpenMealDetail}
              onAddToPlan={onAddToPlan}
              onAddToGrocery={onAddToGrocery}
            />
          ))}
        </div>
      )}
    </div>
  );
};
