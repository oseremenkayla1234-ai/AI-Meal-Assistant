import React, { useState } from 'react';
import {
  X,
  Clock,
  ChefHat,
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ListOrdered,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Meal } from '../types';
import { getNutritionBadgeStyle } from './MealCard';
import { getRealisticFoodImage } from '../utils/foodImages';

interface MealDetailModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onSaveToggle?: (meal: Meal) => void;
  onAddToPlan?: (meal: Meal) => void;
  onAddToGrocery?: (meal: Meal) => void;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  meal,
  isOpen,
  onClose,
  isSaved = false,
  onSaveToggle,
  onAddToPlan,
  onAddToGrocery,
}) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !meal) return null;

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyIngredients = () => {
    const text = meal.ingredients.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const photoUrl = getRealisticFoodImage(meal);

  return (
    <div
      id="meal-detail-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        id="meal-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-detail-title"
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Realistic Photography Hero Header */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-slate-900">
          <img
            src={photoUrl}
            alt={meal.meal_name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30"></div>

          {/* Close button */}
          <button
            id="close-meal-detail-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content overlay */}
          <div className="absolute bottom-4 left-5 right-5 sm:bottom-6 sm:left-8 sm:right-8 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white shadow-sm">
                <span>{meal.emoji || '🍽️'}</span>
                <span className="capitalize">{meal.category || 'Recipe'}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-slate-200">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {meal.time_minutes} minutes
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md ${
                  meal.difficulty === 'Easy'
                    ? 'bg-emerald-500/80 text-white'
                    : meal.difficulty === 'Medium'
                    ? 'bg-amber-500/80 text-white'
                    : 'bg-rose-500/80 text-white'
                }`}
              >
                {meal.difficulty} Difficulty
              </span>
            </div>

            <h2
              id="meal-detail-title"
              className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md"
            >
              {meal.meal_name}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 divide-y divide-slate-100">
          {/* Qualitative Nutrition Badges */}
          <div>
            <div className="flex flex-wrap gap-2">
              {meal.nutrition_tags?.map((tag, idx) => {
                const style = getNutritionBadgeStyle(tag);
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${style.bg}`}
                  >
                    <span>{style.icon}</span>
                    <span>{tag}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Why This Meal Section */}
          <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                Why this meal fits your needs
              </h4>
              <p className="text-xs sm:text-sm text-emerald-950 font-normal leading-relaxed">
                {meal.why_this_meal}
              </p>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="pt-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Ingredients</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {meal.ingredients.length} items
                </span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  id="copy-ingredients-btn"
                  onClick={handleCopyIngredients}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {onAddToGrocery && (
                  <button
                    id="modal-add-to-grocery-btn"
                    onClick={() => onAddToGrocery(meal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add to Grocery</span>
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Check off ingredients you have in your kitchen:
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {meal.ingredients.map((ingredient, idx) => {
                const isChecked = !!checkedIngredients[idx];
                return (
                  <li
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="flex-1">{ingredient}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="pt-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
              <ListOrdered className="w-5 h-5 text-emerald-600" />
              <span>Step-by-Step Instructions</span>
            </h3>

            <div className="space-y-3">
              {meal.instructions.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isActive ? 'text-slate-950 font-medium' : 'text-slate-700'
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Substitutions Panel */}
          {meal.substitutions && meal.substitutions.length > 0 && (
            <div className="pt-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-amber-600" />
                <span>Smart Ingredient Substitutions</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {meal.substitutions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-slate-800 flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
                      <span>If missing:</span>
                      <span className="bg-amber-100/80 px-2 py-0.5 rounded-md text-amber-950">
                        {sub.if_missing}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                      <span>Try instead:</span>
                      <span className="bg-emerald-100/80 px-2 py-0.5 rounded-md text-emerald-950 font-semibold">
                        {sub.try_instead}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            id="close-modal-footer-btn"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onAddToPlan && (
              <button
                id="modal-add-to-plan-btn"
                onClick={() => {
                  onAddToPlan(meal);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-400 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs hover:bg-emerald-50/50 transition-all"
              >
                <CalendarPlus className="w-4 h-4 text-emerald-600" />
                <span>Add to Plan</span>
              </button>
            )}

            {onSaveToggle && (
              <button
                id="modal-save-toggle-btn"
                onClick={() => onSaveToggle(meal)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-all"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 fill-white" />
                    <span>Saved in My Meals</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save to My Meals</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
