import React, { useState } from 'react';
import {
  UserCheck,
  ShieldAlert,
  ThumbsDown,
  Plus,
  X,
  Clock,
  DollarSign,
  ChefHat,
  Target,
  Sparkles,
  Check,
  Info,
} from 'lucide-react';
import {
  UserProfile,
  FoodPreference,
  AgeGroup,
  DietaryPreference,
  CookingSkill,
  BudgetPreference,
} from '../types';

interface ProfilePreferencesProps {
  profile: UserProfile | null;
  preferences: FoodPreference[];
  onUpdateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  onAddPreference: (food_name: string, preference_type: 'dislike' | 'allergy') => Promise<void>;
  onDeletePreference: (id: string) => Promise<void>;
}

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Shellfish',
  'Dairy / Lactose',
  'Gluten / Wheat',
  'Soy',
  'Eggs',
  'Fish',
  'Sesame',
  'Mustard',
];

const COMMON_DISLIKES = [
  'Cilantro',
  'Mushrooms',
  'Olives',
  'Anchovies',
  'Eggplant',
  'Blue Cheese',
  'Spicy Peppers',
  'Beets',
  'Brussels Sprouts',
  'Liver / Organ Meats',
];

export const ProfilePreferences: React.FC<ProfilePreferencesProps> = ({
  profile,
  preferences,
  onUpdateProfile,
  onAddPreference,
  onDeletePreference,
}) => {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(profile?.age_group || '20s');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    profile?.dietary_preference || 'none'
  );
  const [cookingSkill, setCookingSkill] = useState<CookingSkill>(profile?.cooking_skill || 'intermediate');
  const [cookingTime, setCookingTime] = useState<number>(profile?.typical_cooking_time || 25);
  const [budgetPreference, setBudgetPreference] = useState<BudgetPreference>(
    profile?.budget_preference || 'medium'
  );
  const [goals, setGoals] = useState<string[]>(
    profile?.meal_goals || ['Eat healthier', 'High protein']
  );

  const [newAllergy, setNewAllergy] = useState<string>('');
  const [newDislike, setNewDislike] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const allergies = preferences.filter((p) => p.preference_type === 'allergy');
  const dislikes = preferences.filter((p) => p.preference_type === 'dislike');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        age_group: ageGroup,
        dietary_preference: dietaryPreference,
        cooking_skill: cookingSkill,
        typical_cooking_time: cookingTime,
        budget_preference: budgetPreference,
        meal_goals: goals,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAllergy = async (name: string) => {
    if (!name.trim()) return;
    await onAddPreference(name.trim(), 'allergy');
    setNewAllergy('');
  };

  const handleAddDislike = async (name: string) => {
    if (!name.trim()) return;
    await onAddPreference(name.trim(), 'dislike');
    setNewDislike('');
  };

  const toggleGoal = (goalName: string) => {
    if (goals.includes(goalName)) {
      setGoals(goals.filter((g) => g !== goalName));
    } else {
      setGoals([...goals, goalName]);
    }
  };

  const goalPresets = [
    'Eat healthier',
    'High protein',
    'Quick & easy',
    'Fiber-dense & Gut health',
    'Weight balance',
    'Anti-inflammatory',
    'Low carb',
    'Budget-friendly meals',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>AI Personalization Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Preferences & Allergies
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            This profile is passed to Gemini on every request to ensure safe, delicious, tailored meals.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>Profile Saved!</span>
          </span>
        )}
      </div>

      {/* Critical Food Safety: Distinct Allergies vs Dislikes Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 sm:p-6 flex items-start gap-4">
        <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-amber-950">
            Strict Allergy Exclusion vs. Soft Dislike Preference
          </h3>
          <p className="text-xs text-amber-900/90 leading-relaxed font-normal">
            <strong>Allergies</strong> are treated by the AI as absolute hard constraints — they will NEVER appear in any ingredient list. <strong>Dislikes</strong> are soft deprioritizations — the AI will avoid them whenever possible while still allowing flexible recipe creation.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Core Attributes Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-emerald-600" />
            <span>Cooking & Lifestyle Profile</span>
          </h2>

          {/* Age Group */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Age Group
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['teens', '20s', '30s', '40s', '50s', '60s+'] as AgeGroup[]).map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => setAgeGroup(age)}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    ageGroup === age
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Dietary Preference
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { value: 'none', label: 'None / Omnivore' },
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'vegan', label: 'Vegan' },
                { value: 'pescatarian', label: 'Pescatarian' },
                { value: 'mediterranean', label: 'Mediterranean' },
                { value: 'gluten-free', label: 'Gluten-Free' },
                { value: 'dairy-free', label: 'Dairy-Free' },
                { value: 'low-carb', label: 'Low-Carb' },
                { value: 'keto', label: 'Keto' },
                { value: 'paleo', label: 'Paleo' },
              ].map((diet) => (
                <button
                  key={diet.value}
                  type="button"
                  onClick={() => setDietaryPreference(diet.value as any)}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    dietaryPreference === diet.value
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {diet.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cooking Skill & Prep Time & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Skill */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Cooking Skill
              </label>
              <select
                id="cooking-skill-select"
                value={cookingSkill}
                onChange={(e) => setCookingSkill(e.target.value as any)}
                aria-label="Cooking Skill"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
              >
                <option value="beginner">🌱 Beginner (Simple steps)</option>
                <option value="intermediate">🍳 Intermediate (Comfortable)</option>
                <option value="advanced">🔥 Advanced (Multi-step)</option>
              </select>
            </div>

            {/* Typical Cooking Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Default Target Time: {cookingTime} min
              </label>
              <input
                id="cooking-time-range"
                type="range"
                min={10}
                max={60}
                step={5}
                value={cookingTime}
                onChange={(e) => setCookingTime(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                <span>10m</span>
                <span>25m</span>
                <span>45m</span>
                <span>60m+</span>
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Budget Tier
              </label>
              <select
                id="budget-select"
                value={budgetPreference}
                onChange={(e) => setBudgetPreference(e.target.value as any)}
                aria-label="Budget Tier"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
              >
                <option value="low">💰 Budget-Friendly</option>
                <option value="medium">⚖️ Moderate / Standard</option>
                <option value="high">✨ Premium / Gourmet</option>
              </select>
            </div>
          </div>

          {/* Health Goals Multi-Select */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Default Health Goals
            </label>
            <div className="flex flex-wrap gap-2">
              {goalPresets.map((goal) => {
                const isSelected = goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected ? `✓ ${goal}` : `+ ${goal}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Distinct Food Preferences Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allergies Box (Hard Exclusions) */}
          <div className="bg-white rounded-3xl border border-rose-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-900 pb-2 border-b border-rose-100">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h2 className="text-base font-bold">
                Hard Allergens (Strict Exclusion)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Gemini will <strong>never</strong> recommend or include these ingredients.
            </p>

            {/* Current Allergies List */}
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-rose-50/50 border border-rose-200/80">
              {allergies.length === 0 ? (
                <span className="text-xs text-rose-400 italic py-1">
                  No allergies specified.
                </span>
              ) : (
                allergies.map((allergy) => (
                  <span
                    key={allergy.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-2xs"
                  >
                    <span>{allergy.food_name}</span>
                    <button
                      type="button"
                      onClick={() => onDeletePreference(allergy.id)}
                      className="p-0.5 rounded-full hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom Allergy Input */}
            <div className="flex gap-2">
              <input
                id="add-allergy-input"
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy(newAllergy);
                  }
                }}
                placeholder="Type an allergy (e.g. Peanuts, Shellfish)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => handleAddAllergy(newAllergy)}
                disabled={!newAllergy.trim()}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {/* Common Allergens Presets */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Common Allergens
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGENS.map((item) => {
                  const isPresent = allergies.some((a) => a.food_name.toLowerCase() === item.toLowerCase());
                  if (isPresent) return null;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddAllergy(item)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-rose-100 hover:text-rose-900 text-slate-700 border border-slate-200 transition-colors"
                    >
                      + {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dislikes Box (Soft Preferences) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 pb-2 border-b border-slate-100">
              <ThumbsDown className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold">
                Food Dislikes (Soft Avoidance)
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              The AI will avoid these whenever an equal alternative exists.
            </p>

            {/* Current Dislikes List */}
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80">
              {dislikes.length === 0 ? (
                <span className="text-xs text-amber-600/80 italic py-1">
                  No food dislikes specified.
                </span>
              ) : (
                dislikes.map((dislike) => (
                  <span
                    key={dislike.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-700 text-white shadow-2xs"
                  >
                    <span>{dislike.food_name}</span>
                    <button
                      type="button"
                      onClick={() => onDeletePreference(dislike.id)}
                      className="p-0.5 rounded-full hover:bg-amber-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom Dislike Input */}
            <div className="flex gap-2">
              <input
                id="add-dislike-input"
                type="text"
                value={newDislike}
                onChange={(e) => setNewDislike(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDislike(newDislike);
                  }
                }}
                placeholder="Type a dislike (e.g. Cilantro, Olives)..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleAddDislike(newDislike)}
                disabled={!newDislike.trim()}
                className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors disabled:opacity-40"
              >
                Add
              </button>
            </div>

            {/* Common Dislikes Presets */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Common Dislikes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DISLIKES.map((item) => {
                  const isPresent = dislikes.some((d) => d.food_name.toLowerCase() === item.toLowerCase());
                  if (isPresent) return null;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddDislike(item)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 border border-slate-200 transition-colors"
                    >
                      + {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save Profile Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            id="save-profile-btn"
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-sm sm:text-base font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving Profile...' : 'Save Profile & Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
