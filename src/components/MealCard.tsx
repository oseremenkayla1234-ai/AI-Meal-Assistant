import React, { useState } from 'react';
import { Clock, ChefHat, Bookmark, BookmarkCheck, CalendarPlus, ShoppingCart, ArrowRight } from 'lucide-react';
import { Meal } from '../types';
import { getRealisticFoodImage } from '../utils/foodImages';

interface MealCardProps {
  meal: Meal;
  isSaved?: boolean;
  onSaveToggle?: (meal: Meal) => void;
  onOpenDetail: (meal: Meal) => void;
  onAddToPlan?: (meal: Meal) => void;
  onAddToGrocery?: (meal: Meal) => void;
}

export const getNutritionBadgeStyle = (tag: string) => {
  const lower = tag.toLowerCase();
  if (lower.includes('protein')) {
    return { bg: 'bg-amber-100 text-amber-900 border-amber-200', icon: '💪' };
  }
  if (lower.includes('vegetable') || lower.includes('green') || lower.includes('plant')) {
    return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-200', icon: '🥦' };
  }
  if (lower.includes('fiber') || lower.includes('gut')) {
    return { bg: 'bg-lime-100 text-lime-900 border-lime-200', icon: '🌾' };
  }
  if (lower.includes('quick') || lower.includes('easy') || lower.includes('fast')) {
    return { bg: 'bg-blue-100 text-blue-900 border-blue-200', icon: '⚡' };
  }
  if (lower.includes('budget') || lower.includes('economical')) {
    return { bg: 'bg-teal-100 text-teal-900 border-teal-200', icon: '💰' };
  }
  if (lower.includes('heart') || lower.includes('cardio') || lower.includes('anti-inflammatory')) {
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', icon: '❤️' };
  }
  return { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: '🟢' };
};

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  isSaved = false,
  onSaveToggle,
  onOpenDetail,
  onAddToPlan,
  onAddToGrocery,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageUrl = getRealisticFoodImage(meal);

  return (
    <div
      id={`meal-card-${meal.id}`}
      className="group relative flex flex-col justify-between bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-400/80 transition-all duration-300 overflow-hidden"
    >
      <div>
        {/* Realistic Food Image Header */}
        <div
          onClick={() => onOpenDetail(meal)}
          className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 cursor-pointer"
        >
          <img
            src={imageUrl}
            alt={meal.meal_name}
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-80 blur-xs'
            }`}
          />

          {/* Gradient protection scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/25"></div>

          {/* Top category & bookmark buttons */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="pointer-events-auto inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md shadow-xs">
              <span>{meal.emoji || '🍽️'}</span>
              <span className="capitalize">{meal.category || 'Curated Meal'}</span>
            </span>

            {onSaveToggle && (
              <button
                id={`save-meal-btn-${meal.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveToggle(meal);
                }}
                title={isSaved ? 'Remove from Saved' : 'Save Meal'}
                className={`pointer-events-auto p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
                  isSaved
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 scale-105'
                    : 'bg-white/85 text-slate-800 hover:bg-white hover:scale-105'
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Bookmark className="w-4 h-4 text-slate-700" />
                )}
              </button>
            )}
          </div>

          {/* Bottom metadata chip on image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white text-xs font-semibold">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {meal.time_minutes} min
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg font-bold backdrop-blur-xs ${
                meal.difficulty === 'Easy'
                  ? 'bg-emerald-500/80 text-white'
                  : meal.difficulty === 'Medium'
                  ? 'bg-amber-500/80 text-white'
                  : 'bg-rose-500/80 text-white'
              }`}
            >
              {meal.difficulty}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Meal Name */}
          <h3
            onClick={() => onOpenDetail(meal)}
            className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-emerald-700 cursor-pointer transition-colors"
          >
            {meal.meal_name}
          </h3>

          {/* Why this meal */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">
            {meal.why_this_meal}
          </p>

          {/* Qualitative Nutrition Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {meal.nutrition_tags?.slice(0, 3).map((tag, idx) => {
              const style = getNutritionBadgeStyle(tag);
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border ${style.bg}`}
                >
                  <span>{style.icon}</span>
                  <span>{tag}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <button
          id={`view-recipe-btn-${meal.id}`}
          onClick={() => onOpenDetail(meal)}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          View Recipe & Steps
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          {onAddToPlan && (
            <button
              id={`add-to-plan-btn-${meal.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlan(meal);
              }}
              title="Add to Weekly Meal Plan"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-slate-600" />
              <span>Plan</span>
            </button>
          )}

          {onAddToGrocery && (
            <button
              id={`add-to-grocery-btn-${meal.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToGrocery(meal);
              }}
              title="Add Ingredients to Grocery List"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grocery</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
