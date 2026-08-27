import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Clock,
  DollarSign,
  Utensils,
  Target,
  User,
  Flame,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  CalendarPlus,
  ShoppingCart,
} from 'lucide-react';
import { UserProfile, FoodPreference, Meal, MealCategory, DietaryPreference, AgeGroup, BudgetPreference } from '../types';
import { MealCard } from './MealCard';

interface PersonalizationWizardProps {
  profile: UserProfile | null;
  preferences: FoodPreference[];
  onGenerateMeal: (params: {
    meal_type?: MealCategory;
    available_ingredients?: string[];
    override_time?: number;
    cravings_or_notes?: string;
    custom_goal?: string;
  }) => Promise<Meal>;
  onOpenMealDetail: (meal: Meal) => void;
  savedMeals: Meal[];
  onSaveToggle: (meal: Meal) => void;
  onAddToPlan: (meal: Meal) => void;
  onAddToGrocery: (meal: Meal) => void;
}

export const PersonalizationWizard: React.FC<PersonalizationWizardProps> = ({
  profile,
  preferences,
  onGenerateMeal,
  onOpenMealDetail,
  savedMeals,
  onSaveToggle,
  onAddToPlan,
  onAddToGrocery,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedAge, setSelectedAge] = useState<AgeGroup>(profile?.age_group || '20s');
  const [selectedGoal, setSelectedGoal] = useState<string>(profile?.meal_goals?.[0] || 'Eat healthier');
  const [selectedDiet, setSelectedDiet] = useState<DietaryPreference>(profile?.dietary_preference || 'none');
  const [selectedTime, setSelectedTime] = useState<number>(profile?.typical_cooking_time || 25);
  const [selectedBudget, setSelectedBudget] = useState<BudgetPreference>(profile?.budget_preference || 'medium');
  const [selectedSlot, setSelectedSlot] = useState<MealCategory>('dinner');
  const [cravings, setCravings] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedMeal, setGeneratedMeal] = useState<Meal | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allergyList = preferences.filter((p) => p.preference_type === 'allergy').map((p) => p.food_name);
  const dislikeList = preferences.filter((p) => p.preference_type === 'dislike').map((p) => p.food_name);

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const meal = await onGenerateMeal({
        meal_type: selectedSlot,
        override_time: selectedTime,
        custom_goal: selectedGoal,
        cravings_or_notes: cravings.trim() ? cravings.trim() : undefined,
      });
      setGeneratedMeal(meal);
    } catch (err: any) {
      setErrorMsg(err.message || "Couldn't generate a meal right now — try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const ageOptions: { value: AgeGroup; label: string }[] = [
    { value: 'teens', label: 'Teens' },
    { value: '20s', label: '20s' },
    { value: '30s', label: '30s' },
    { value: '40s', label: '40s' },
    { value: '50s', label: '50s' },
    { value: '60s+', label: '60s+' },
  ];

  const goalOptions = [
    { label: 'Eat healthier', icon: '🥗', desc: 'Balanced, nutrient-dense daily meals' },
    { label: 'High protein', icon: '💪', desc: 'Muscle support and long satiety' },
    { label: 'Quick & easy', icon: '⚡', desc: 'Fast preparation, minimal cleanup' },
    { label: 'Fiber-dense & Gut health', icon: '🌾', desc: 'Digestive vitality and whole grains' },
    { label: 'Weight balance', icon: '⚖️', desc: 'Mindful calories and portion balance' },
    { label: 'Anti-inflammatory', icon: '🌿', desc: 'Turmeric, greens, berries, good fats' },
  ];

  const dietOptions: { value: DietaryPreference; label: string }[] = [
    { value: 'none', label: 'No Restrictions' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'dairy-free', label: 'Dairy-Free' },
    { value: 'low-carb', label: 'Low-Carb' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
  ];

  const timeOptions = [
    { value: 15, label: '15 min', desc: 'Express meal' },
    { value: 25, label: '25 min', desc: 'Standard weeknight' },
    { value: 40, label: '40 min', desc: 'Comfort cooking' },
    { value: 60, label: '60+ min', desc: 'Leisurely feast' },
  ];

  const slotOptions: { value: MealCategory; label: string; icon: string }[] = [
    { value: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { value: 'lunch', label: 'Lunch', icon: '🥗' },
    { value: 'dinner', label: 'Dinner', icon: '🍲' },
    { value: 'snack', label: 'Healthy Snack', icon: '🍎' },
    { value: 'any', label: 'Surprise Me', icon: '✨' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Food Decision Companion</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white mb-3">
            What Should I Eat?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            Eliminate dinner fatigue. Tell the AI who you are, what health goal you're targeting, and how much time you have — and receive a fresh, personalized recipe instantly.
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Allergens Excluded: <strong>{allergyList.length ? allergyList.join(', ') : 'None'}</strong>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Target Time: <strong>{selectedTime}m</strong>
            </span>
          </div>
        </div>

        {/* Decorative Background Accent */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 text-[180px] select-none pointer-events-none">
          🥑
        </div>
      </div>

      {/* Main Flow Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              {step}
            </span>
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {step === 1 && 'Who are you & what is your goal?'}
              {step === 2 && 'Dietary Style & Cooking Time'}
              {step === 3 && 'Meal Slot & Specific Cravings'}
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-600">
            Step {step} of 3
          </div>
        </div>

        {/* Step 1: Age & Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                1. Age Group
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {ageOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedAge(opt.value)}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      selectedAge === opt.value
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                2. Primary Health Goal For This Meal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {goalOptions.map((goal) => {
                  const isSelected = selectedGoal === goal.label;
                  return (
                    <div
                      key={goal.label}
                      onClick={() => setSelectedGoal(goal.label)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{goal.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                      </div>
                      <div className="font-bold text-sm text-slate-900 mb-0.5">{goal.label}</div>
                      <div className="text-xs text-slate-500">{goal.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                id="wizard-next-step-1"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Diet & Time */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                1. Dietary Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {dietOptions.map((diet) => (
                  <button
                    key={diet.value}
                    type="button"
                    onClick={() => setSelectedDiet(diet.value)}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      selectedDiet === diet.value
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {diet.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                2. Available Cooking Time
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {timeOptions.map((time) => {
                  const isSelected = selectedTime === time.value;
                  return (
                    <div
                      key={time.value}
                      onClick={() => setSelectedTime(time.value)}
                      className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="font-extrabold text-base text-slate-900 mb-0.5">{time.label}</div>
                      <div className="text-xs text-slate-500">{time.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                3. Budget Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as BudgetPreference[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBudget(b)}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border capitalize transition-all ${
                      selectedBudget === b
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {b === 'low' && '💰 Budget-Friendly'}
                    {b === 'medium' && '⚖️ Moderate'}
                    {b === 'high' && '✨ Premium / Organic'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                id="wizard-back-step-2"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back
              </button>
              <button
                id="wizard-next-step-2"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Meal Slot & Flavor Cravings */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                1. Which meal is this for?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {slotOptions.map((slot) => {
                  const isSelected = selectedSlot === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => setSelectedSlot(slot.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span className="text-2xl">{slot.icon}</span>
                      <span className="text-xs sm:text-sm">{slot.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                2. Any specific cravings, flavors, or mood? (Optional)
              </label>
              <input
                id="cravings-input"
                type="text"
                value={cravings}
                onChange={(e) => setCravings(e.target.value)}
                placeholder="e.g. Warm comforting soup, spicy kick, crunchy salad, lemon garlic aroma..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Constraints Verification Strip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Active Profile Constraints:</span>
                <span>{selectedDiet !== 'none' ? `${selectedDiet} diet` : 'No restrictions'}</span>
                <span>•</span>
                <span>{selectedTime} min</span>
              </div>
              {allergyList.length > 0 && (
                <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Strictly Excluding: {allergyList.join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                id="wizard-back-step-3"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Back
              </button>

              <button
                id="generate-personalized-meal-btn"
                onClick={handleGenerate}
                disabled={isLoading}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>AI is crafting your meal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Personalized Meal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading Screen Indicator */}
      {isLoading && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center shadow-md animate-pulse">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-100 text-emerald-800 mb-4 animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
            Cooking up a customized recommendation with Gemini...
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Checking your dietary style ({selectedDiet}), respecting allergy constraints, and balancing flavors for your {selectedGoal.toLowerCase()} goal.
          </p>
        </div>
      )}

      {/* Error Message Screen */}
      {errorMsg && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center justify-between gap-3">
          <span>{errorMsg}</span>
          <button
            onClick={handleGenerate}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Generated Meal Result Section */}
      {generatedMeal && !isLoading && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Your AI Recommendation
              </h2>
            </div>

            <button
              id="regenerate-meal-btn"
              onClick={handleGenerate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Regenerate Another</span>
            </button>
          </div>

          <MealCard
            meal={generatedMeal}
            isSaved={savedMeals.some((m) => m.id === generatedMeal.id || m.meal_name === generatedMeal.meal_name)}
            onSaveToggle={onSaveToggle}
            onOpenDetail={onOpenMealDetail}
            onAddToPlan={onAddToPlan}
            onAddToGrocery={onAddToGrocery}
          />
        </div>
      )}
    </div>
  );
};
