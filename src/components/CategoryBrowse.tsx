import React, { useState } from 'react';
import { Sparkles, Utensils, Clock, ChefHat, RefreshCw } from 'lucide-react';
import { Meal, MealCategory, UserProfile, FoodPreference } from '../types';
import { MealCard } from './MealCard';

interface CategoryBrowseProps {
  onGenerateCategoryMeal: (category: MealCategory) => Promise<Meal>;
  onOpenMealDetail: (meal: Meal) => void;
  savedMeals: Meal[];
  onSaveToggle: (meal: Meal) => void;
  onAddToPlan: (meal: Meal) => void;
  onAddToGrocery: (meal: Meal) => void;
}

const CURATED_CATEGORY_MEALS: Record<MealCategory, Meal[]> = {
  breakfast: [
    {
      id: 'cat_bf_1',
      meal_name: 'Overnight Chia Berry Protein Pudding',
      emoji: '🍓',
      time_minutes: 10,
      difficulty: 'Easy',
      nutrition_tags: ['High Protein', 'Fiber-Dense', 'Quick & Easy'],
      ingredients: [
        '3 tbsp chia seeds',
        '1 cup unsweetened almond milk',
        '1 scoop plant protein powder (vanilla)',
        '1/2 cup fresh blueberries or raspberries',
        '1 tbsp almond butter',
        '1/2 tsp ground cinnamon'
      ],
      instructions: [
        'In a mason jar, whisk chia seeds, almond milk, protein powder, and cinnamon until lump-free.',
        'Let rest for 5 minutes, stir again to prevent settling, then refrigerate for at least 2 hours or overnight.',
        'Top with fresh mixed berries and a drizzle of almond butter before serving chilled.'
      ],
      why_this_meal: 'Provides slow-burning complex carbs, healthy omega-3 fatty acids, and bioavailable protein for lasting morning focus.',
      substitutions: [
        { if_missing: 'Almond milk', try_instead: 'Oat milk, soy milk, or coconut milk' },
        { if_missing: 'Chia seeds', try_instead: 'Rolled oats for overnight oats' }
      ],
      category: 'breakfast'
    },
    {
      id: 'cat_bf_2',
      meal_name: 'Mediterranean Shakshuka with Poached Eggs',
      emoji: '🍳',
      time_minutes: 25,
      difficulty: 'Medium',
      nutrition_tags: ['Balanced', 'Vegetable-Rich', 'High Protein'],
      ingredients: [
        '3 pasture-raised eggs',
        '1 can (14 oz) diced tomatoes',
        '1 bell pepper, diced',
        '1 small yellow onion, diced',
        '2 cloves garlic, minced',
        '1 tsp smoked paprika',
        '1/2 tsp ground cumin',
        '1 tbsp olive oil',
        'Fresh parsley and crumbled feta for garnish'
      ],
      instructions: [
        'Heat olive oil in a skillet. Sauté onion and bell pepper for 5 minutes until tender.',
        'Stir in garlic, paprika, and cumin for 1 minute until aromatic. Pour in diced tomatoes and simmer for 10 minutes.',
        'Make 3 small wells in the sauce. Crack an egg into each well. Cover and simmer on low for 6-8 minutes until whites are set.',
        'Garnish with fresh parsley and crumbled feta cheese. Serve warm with crusty bread.'
      ],
      why_this_meal: 'Rich in lycopene from cooked tomatoes, antioxidants from colorful peppers, and quality egg protein.',
      substitutions: [
        { if_missing: 'Bell pepper', try_instead: 'Zucchini or spinach' },
        { if_missing: 'Eggs', try_instead: 'Silken tofu or chickpeas' }
      ],
      category: 'breakfast'
    }
  ],
  lunch: [
    {
      id: 'cat_ln_1',
      meal_name: 'Rainbow Quinoa Power Bowl with Tahini Lemon',
      emoji: '🥗',
      time_minutes: 20,
      difficulty: 'Easy',
      nutrition_tags: ['Fiber-Dense', 'Vegetable-Rich', 'High Protein'],
      ingredients: [
        '1 cup cooked quinoa',
        '1/2 cup canned chickpeas, rinsed',
        '1 cup shredded red cabbage',
        '1 Persian cucumber, sliced',
        '1/2 avocado, diced',
        '2 tbsp tahini',
        '1 tbsp warm water',
        '1 tbsp lemon juice',
        '1 tsp maple syrup'
      ],
      instructions: [
        'Layer cooked warm or chilled quinoa in the base of a wide bowl.',
        'Arrange chickpeas, shredded red cabbage, cucumber slices, and avocado in distinct vibrant sections.',
        'In a ramekin, whisk tahini, lemon juice, maple syrup, and warm water until a creamy drizzle forms.',
        'Pour dressing over the bowl and toss lightly before enjoying.'
      ],
      why_this_meal: 'Offers all 9 essential amino acids from complete-protein quinoa, topped with crunchy raw veggies and anti-inflammatory tahini fats.',
      substitutions: [
        { if_missing: 'Quinoa', try_instead: 'Brown rice, farro, or cauliflower rice' },
        { if_missing: 'Tahini', try_instead: 'Hummus or Greek yogurt garlic dressing' }
      ],
      category: 'lunch'
    },
    {
      id: 'cat_ln_2',
      meal_name: 'Grilled Pesto Chicken & Roasted Veggie Wrap',
      emoji: '🌯',
      time_minutes: 20,
      difficulty: 'Easy',
      nutrition_tags: ['High Protein', 'Quick & Easy', 'Balanced'],
      ingredients: [
        '1 whole grain or spinach tortilla',
        '1 grilled chicken breast, sliced',
        '2 tbsp basil pesto',
        '1/2 cup roasted bell peppers (or jarred)',
        '1 cup fresh arugula',
        '2 tbsp goat cheese or mozzarella'
      ],
      instructions: [
        'Warm the whole grain tortilla in a dry skillet for 30 seconds until pliable.',
        'Spread fresh basil pesto evenly across the center.',
        'Layer sliced grilled chicken, roasted bell peppers, goat cheese, and fresh peppery arugula.',
        'Tuck the sides in and roll tightly into a wrap. Slice diagonally.'
      ],
      why_this_meal: 'Fast, portable, and delivers over 30 grams of lean protein with wholesome leafy greens.',
      substitutions: [
        { if_missing: 'Chicken', try_instead: 'Grilled tofu, roasted turkey, or chickpeas' },
        { if_missing: 'Tortilla', try_instead: 'Collard green leaf or whole grain pita' }
      ],
      category: 'lunch'
    }
  ],
  dinner: [
    {
      id: 'cat_dn_1',
      meal_name: 'Wild Herb Salmon with Asparagus & Garlic Rice',
      emoji: '🐟',
      time_minutes: 25,
      difficulty: 'Medium',
      nutrition_tags: ['High Protein', 'Balanced', 'Heart Healthy'],
      ingredients: [
        '2 wild salmon fillets (6 oz each)',
        '1 bunch fresh asparagus, woody ends trimmed',
        '1 cup jasmine or brown rice',
        '2 cloves garlic, minced',
        '1 tbsp olive oil',
        '1 tbsp fresh dill, chopped',
        '1 lemon, sliced into rounds',
        'Salt and freshly cracked pepper'
      ],
      instructions: [
        'Preheat oven to 400°F (200°C). Cook rice according to package directions with one clove of minced garlic.',
        'Place salmon fillets and asparagus on a parchment-lined baking sheet. Drizzle with olive oil, minced garlic, salt, and pepper.',
        'Top salmon fillets with lemon slices and chopped dill.',
        'Roast for 12-14 minutes until salmon flakes easily with a fork and asparagus is tender-crisp. Serve alongside warm garlic rice.'
      ],
      why_this_meal: 'High in marine omega-3 fatty acids EPA & DHA to support cardiovascular wellness and reduce oxidative stress.',
      substitutions: [
        { if_missing: 'Salmon', try_instead: 'Trout, cod, or marinated portobello mushroom caps' },
        { if_missing: 'Asparagus', try_instead: 'Broccolini or green beans' }
      ],
      category: 'dinner'
    },
    {
      id: 'cat_dn_2',
      meal_name: 'Coconut Ginger Red Lentil Dahl',
      emoji: '🍲',
      time_minutes: 30,
      difficulty: 'Easy',
      nutrition_tags: ['Fiber-Dense', 'Budget-Friendly', 'Vegetable-Rich'],
      ingredients: [
        '1 cup dry red split lentils, rinsed',
        '1 can (14 oz) light coconut milk',
        '2 cups vegetable broth',
        '1 yellow onion, finely diced',
        '1 tbsp fresh ginger, grated',
        '3 cloves garlic, minced',
        '1 tbsp curry powder',
        '1 tsp ground turmeric',
        '2 cups baby spinach',
        'Fresh cilantro and lime wedges'
      ],
      instructions: [
        'Sauté onion, garlic, and ginger in a pot with a touch of oil for 4 minutes.',
        'Add curry powder and turmeric, stirring for 1 minute until fragrant.',
        'Add red lentils, coconut milk, and vegetable broth. Bring to a boil, then reduce heat and simmer uncovered for 20 minutes.',
        'Stir in baby spinach until wilted. Squeeze fresh lime juice and serve with brown rice or naan.'
      ],
      why_this_meal: 'Nutrient-rich, comforting plant-based dinner loaded with prebiotic dietary fiber and anti-inflammatory spices.',
      substitutions: [
        { if_missing: 'Red lentils', try_instead: 'Yellow split peas or brown lentils (adjust simmer time)' },
        { if_missing: 'Coconut milk', try_instead: 'Oat milk with 1 tbsp olive oil' }
      ],
      category: 'dinner'
    }
  ],
  snack: [
    {
      id: 'cat_sn_1',
      meal_name: 'Crispy Paprika Garlic Roasted Chickpeas',
      emoji: '🍿',
      time_minutes: 25,
      difficulty: 'Easy',
      nutrition_tags: ['High Protein', 'Fiber-Dense', 'Budget-Friendly'],
      ingredients: [
        '1 can (15 oz) chickpeas, rinsed and thoroughly dried',
        '1 tbsp olive oil',
        '1/2 tsp smoked paprika',
        '1/2 tsp garlic powder',
        '1/4 tsp sea salt',
        'Pinch of cayenne pepper'
      ],
      instructions: [
        'Preheat oven to 400°F (200°C). Dry chickpeas thoroughly between paper towels (dry chickpeas equal extra crunch!).',
        'Toss chickpeas with olive oil, paprika, garlic powder, salt, and cayenne.',
        'Spread in a single layer on a baking sheet and bake for 22-25 minutes, shaking the pan halfway through, until deeply golden and crunchy.',
        'Let cool for 5 minutes before enjoying as a high-protein crunch snack.'
      ],
      why_this_meal: 'Satisfies salty, crunchy cravings while providing 7g of plant protein and 6g of fiber per serving.',
      substitutions: [
        { if_missing: 'Chickpeas', try_instead: 'Edamame beans or pumpkin seeds' }
      ],
      category: 'snack'
    },
    {
      id: 'cat_sn_2',
      meal_name: 'Apple Slices with Cacao Almond Butter Dip',
      emoji: '🍏',
      time_minutes: 5,
      difficulty: 'Easy',
      nutrition_tags: ['Quick & Easy', 'Fiber-Dense', 'Nutrient-Rich'],
      ingredients: [
        '1 crisp Honeycrisp or Granny Smith apple, sliced',
        '2 tbsp creamy almond butter',
        '1 tsp raw unsweetened cacao powder',
        '1/2 tsp pure maple syrup or honey',
        '1 tbsp hemp hearts or chia seeds'
      ],
      instructions: [
        'In a small dip cup, stir almond butter, cacao powder, and maple syrup until smooth and fudgy.',
        'Slice apple into thin wedges.',
        'Sprinkle dip with hemp hearts and serve apple slices immediately.'
      ],
      why_this_meal: 'Combines pectin fiber from apples with polyphenol-rich raw cacao and satiating healthy fats.',
      substitutions: [
        { if_missing: 'Almond butter', try_instead: 'Peanut butter, sunflower seed butter, or tahini' }
      ],
      category: 'snack'
    }
  ],
  any: []
};

export const CategoryBrowse: React.FC<CategoryBrowseProps> = ({
  onGenerateCategoryMeal,
  onOpenMealDetail,
  savedMeals,
  onSaveToggle,
  onAddToPlan,
  onAddToGrocery,
}) => {
  const [activeCategory, setActiveCategory] = useState<MealCategory>('dinner');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [categoryMeals, setCategoryMeals] = useState<Record<MealCategory, Meal[]>>(CURATED_CATEGORY_MEALS);
  const [filterTime, setFilterTime] = useState<'all' | 'quick' | 'medium'>('all');

  const handleGenerateFresh = async () => {
    setIsGenerating(true);
    try {
      const newMeal = await onGenerateCategoryMeal(activeCategory);
      setCategoryMeals((prev) => ({
        ...prev,
        [activeCategory]: [newMeal, ...(prev[activeCategory] || [])],
      }));
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const categories: { id: MealCategory; label: string; icon: string; desc: string }[] = [
    { id: 'breakfast', label: 'Breakfast', icon: '🍳', desc: 'Energizing morning starts' },
    { id: 'lunch', label: 'Lunch', icon: '🥗', desc: 'Sustained afternoon vitality' },
    { id: 'dinner', label: 'Dinner', icon: '🍲', desc: 'Nourishing evening comfort' },
    { id: 'snack', label: 'Healthy Snacks', icon: '🍎', desc: 'Smart midday bites' },
  ];

  const currentList = (categoryMeals[activeCategory] || []).filter((m) => {
    if (filterTime === 'quick') return m.time_minutes <= 20;
    if (filterTime === 'medium') return m.time_minutes <= 30;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <Utensils className="w-3.5 h-3.5" />
            <span>Curated & AI Meals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meal Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Browse wholesome options by time of day or generate a brand new recipe with Gemini on demand.
          </p>
        </div>

        <button
          id="generate-category-meal-btn"
          onClick={handleGenerateFresh}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating {activeCategory} meal...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Fresh {activeCategory.toUpperCase()} Meal with AI</span>
            </>
          )}
        </button>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((c) => {
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setFilterTime('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterTime === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            All Times
          </button>
          <button
            onClick={() => setFilterTime('quick')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterTime === 'quick' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            ⚡ ≤ 20 min
          </button>
          <button
            onClick={() => setFilterTime('medium')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterTime === 'medium' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            ⏱️ ≤ 30 min
          </button>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentList.map((meal) => (
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
  );
};
