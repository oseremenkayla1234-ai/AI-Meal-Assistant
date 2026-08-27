import { GoogleGenAI, Type } from '@google/genai';
import crypto from 'crypto';
import { Meal, UserProfile, FoodPreference } from '../src/types.js';

const CANDIDATE_MODELS = Array.from(
  new Set([process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-3.7-flash'].filter(Boolean) as string[])
);

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_key') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 15-minute response cache to prevent redundant API spend
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheKey(prefix: string, payload: any): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return `${prefix}:${hash}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setInCache(key: string, data: any): void {
  if (cache.size > 200) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

const SYSTEM_PROMPT = `You are a friendly, knowledgeable AI meal assistant. Your job is to recommend practical, healthy meals tailored to the user's profile and context.

Rules:
- Only recommend meals that are realistic to cook with common kitchen equipment.
- Respect ALLERGIES as absolute hard constraints — NEVER include an allergen ingredient under any circumstances, even as a minor or optional ingredient.
- Treat DISLIKES as soft preferences — avoid them when a good alternative exists, but you may still include a disliked ingredient if it's clearly the best fit for the request; briefly note why if you do.
- Keep nutrition guidance qualitative and general (e.g. "high protein", "fiber-rich", "vegetable-packed", "balanced energy") — do not give precise medical or clinical nutrition claims or raw macro numbers.
- You are not a medical professional. If the user mentions a medical condition, medication, or a diet prescribed by a doctor, do not tailor nutrition advice to that condition — gently suggest they consult a healthcare professional or registered dietitian, and keep your response general.
- Always respond with valid JSON only, matching the schema provided. No markdown code blocks, no commentary, no text outside the JSON object.`;

const SINGLE_MEAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    meal_name: { type: Type.STRING, description: 'Descriptive, appetizing name of the meal' },
    emoji: { type: Type.STRING, description: 'A single relevant food emoji, e.g. 🥗, 🍲, 🥑' },
    time_minutes: { type: Type.NUMBER, description: 'Total cooking and prep time in minutes' },
    difficulty: { type: Type.STRING, description: 'Easy | Medium | Hard' },
    nutrition_tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Qualitative nutrition tags e.g. ["High Protein", "Vegetable-Rich", "Fiber-Dense", "Quick & Easy", "Budget-Friendly"]'
    },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of ingredients with quantities'
    },
    instructions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Step-by-step cooking instructions'
    },
    why_this_meal: {
      type: Type.STRING,
      description: 'Brief 1-2 sentence explanation of why this meal fits the user profile and request'
    },
    substitutions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          if_missing: { type: Type.STRING },
          try_instead: { type: Type.STRING }
        },
        required: ['if_missing', 'try_instead']
      },
      description: '2-3 helpful ingredient substitutions if items are missing'
    }
  },
  required: ['meal_name', 'emoji', 'time_minutes', 'difficulty', 'nutrition_tags', 'ingredients', 'instructions', 'why_this_meal', 'substitutions']
};

const MULTI_MEAL_SCHEMA = {
  type: Type.ARRAY,
  items: SINGLE_MEAL_SCHEMA,
  description: 'List of 2 to 3 distinct meal suggestions'
};

function formatUserPrompt(
  profile: UserProfile,
  preferences: FoodPreference[],
  requestContext: {
    meal_type?: string;
    available_ingredients?: string[];
    override_time?: number;
    cravings_or_notes?: string;
    custom_goal?: string;
    is_multi?: boolean;
  }
): string {
  const allergies = preferences
    .filter((p) => p.preference_type === 'allergy')
    .map((p) => p.food_name)
    .join(', ') || 'None specified';

  const dislikes = preferences
    .filter((p) => p.preference_type === 'dislike')
    .map((p) => p.food_name)
    .join(', ') || 'None specified';

  const goals = requestContext.custom_goal
    ? `${profile.meal_goals.join(', ')}, ${requestContext.custom_goal}`
    : profile.meal_goals.join(', ') || 'Healthy, balanced eating';

  const time = requestContext.override_time || profile.typical_cooking_time || 25;

  let prompt = `User profile:
- Age group: ${profile.age_group || 'Adult'}
- Dietary preference: ${profile.dietary_preference || 'None'}
- Cooking skill: ${profile.cooking_skill || 'Intermediate'}
- Available time: ${time} minutes
- Budget: ${profile.budget_preference || 'Medium'}
- Goals: ${goals}
- Allergies (hard exclude - NEVER include these): ${allergies}
- Dislikes (soft avoid): ${dislikes}

Request context:
- Meal type requested: ${requestContext.meal_type || 'any'}
`;

  if (requestContext.available_ingredients && requestContext.available_ingredients.length > 0) {
    prompt += `- Available ingredients (MUST prioritize using these): ${requestContext.available_ingredients.join(', ')}\n`;
  }

  if (requestContext.cravings_or_notes) {
    prompt += `- User cravings / notes: ${requestContext.cravings_or_notes}\n`;
  }

  if (requestContext.is_multi) {
    prompt += `\nPlease generate 3 distinct, creative, and delicious meal options utilizing the ingredients and fitting the user constraints. Return as a JSON array of 3 meal objects.`;
  } else {
    prompt += `\nPlease generate 1 delicious, personalized meal recommendation matching these requirements. Return as a single JSON meal object.`;
  }

  return prompt;
}

function validateMealObject(obj: any): obj is Meal {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.meal_name !== 'string' || !obj.meal_name.trim()) return false;
  if (typeof obj.emoji !== 'string') obj.emoji = '🍽️';
  if (typeof obj.time_minutes !== 'number' || isNaN(obj.time_minutes)) obj.time_minutes = 20;
  if (!['Easy', 'Medium', 'Hard'].includes(obj.difficulty)) obj.difficulty = 'Easy';
  if (!Array.isArray(obj.nutrition_tags)) obj.nutrition_tags = ['Balanced', 'Nutritious'];
  if (!Array.isArray(obj.ingredients) || obj.ingredients.length === 0) return false;
  if (!Array.isArray(obj.instructions) || obj.instructions.length === 0) return false;
  if (typeof obj.why_this_meal !== 'string') obj.why_this_meal = 'Crafted to match your health goals and preferences.';
  if (!Array.isArray(obj.substitutions)) obj.substitutions = [];
  return true;
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

// -------------------------------------------------------------
// INTELLIGENT PERSONALIZED RECIPE SYNTHESIZER (FALLBACK & SEEDING)
// -------------------------------------------------------------

function generateDynamicPersonalizedMeal(
  profile: UserProfile,
  preferences: FoodPreference[],
  context: {
    meal_type?: string;
    available_ingredients?: string[];
    override_time?: number;
    cravings_or_notes?: string;
    custom_goal?: string;
  }
): Meal {
  const diet = (profile.dietary_preference || 'none').toLowerCase();
  const time = context.override_time || profile.typical_cooking_time || 25;
  const mealType = (context.meal_type || 'dinner').toLowerCase();
  const allergies = preferences
    .filter((p) => p.preference_type === 'allergy')
    .map((p) => p.food_name.toLowerCase());
  const dislikes = preferences
    .filter((p) => p.preference_type === 'dislike')
    .map((p) => p.food_name.toLowerCase());

  const hasAllergy = (ing: string) => allergies.some((a) => ing.toLowerCase().includes(a));
  const hasDislike = (ing: string) => dislikes.some((d) => ing.toLowerCase().includes(d));

  // Recipe catalog organized by archetype
  const templates: Array<{
    name: string;
    emoji: string;
    dietOk: (d: string) => boolean;
    slots: string[];
    time: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    tags: string[];
    ingredients: string[];
    instructions: string[];
    why: string;
    subs: { if_missing: string; try_instead: string }[];
  }> = [
    {
      name: 'Mediterranean Lemon Herb Grilled Chicken Bowl',
      emoji: '🥗',
      dietOk: (d) => ['none', 'mediterranean', 'gluten-free', 'dairy-free', 'low-carb', 'paleo'].includes(d),
      slots: ['lunch', 'dinner', 'any'],
      time: 25,
      difficulty: 'Easy',
      tags: ['High Protein', 'Heart Healthy', 'Mediterranean Diet', 'Nutrient Rich'],
      ingredients: [
        '250g Chicken breast (or firm tofu)',
        '1 cup Quinoa or warm brown rice',
        '1 cup Cherry tomatoes, halved',
        '1 English cucumber, diced',
        '2 tbsp Extra virgin olive oil',
        '1 tbsp Fresh lemon juice',
        '1 tsp Dried oregano & garlic powder',
        'Fresh chopped parsley',
      ],
      instructions: [
        'Season chicken breast with olive oil, lemon juice, dried oregano, salt, and black pepper.',
        'Sear in a medium skillet over medium-high heat for 6-7 minutes per side until golden and thoroughly cooked.',
        'Warm quinoa and divide into serving bowls.',
        'Top with diced cucumber, cherry tomatoes, sliced warm chicken, and fresh chopped parsley.',
        'Drizzle with remaining extra virgin olive oil and a squeeze of fresh lemon.',
      ],
      why: 'Packed with lean protein, polyphenol-rich olive oil, and crisp vegetables for steady, clean energy.',
      subs: [
        { if_missing: 'Chicken breast', try_instead: 'Extra-firm tofu, chickpeas, or turkey cutlets' },
        { if_missing: 'Quinoa', try_instead: 'Brown rice, couscous, or riced cauliflower' },
      ],
    },
    {
      name: 'Tuscan Sun-Dried Tomato & White Bean Skillet',
      emoji: '🍲',
      dietOk: (d) => ['none', 'vegetarian', 'vegan', 'mediterranean', 'gluten-free', 'dairy-free'].includes(d),
      slots: ['lunch', 'dinner', 'any'],
      time: 20,
      difficulty: 'Easy',
      tags: ['Plant-Based', 'High Fiber', 'Gut Health', 'Quick & Easy', 'Anti-Inflammatory'],
      ingredients: [
        '1 can (400g) Cannellini beans, rinsed & drained',
        '2 cups Baby spinach or chopped kale',
        '1/3 cup Sun-dried tomatoes, thinly sliced',
        '3 cloves Garlic, minced',
        '1 cup Low-sodium vegetable broth',
        '1 tbsp Olive oil',
        '1/2 tsp Crushed red pepper flakes',
        'Fresh basil leaves',
      ],
      instructions: [
        'Heat olive oil in a wide skillet over medium heat. Sauté minced garlic and chili flakes for 60 seconds until fragrant.',
        'Add sun-dried tomatoes and rinsed cannellini beans, stirring to coat in the aromatic oil.',
        'Pour in vegetable broth, bring to a gentle simmer, and cook for 5 minutes until liquid slightly reduces.',
        'Fold in baby spinach until wilted and vibrant green (about 2 minutes).',
        'Garnish with fresh torn basil and serve warm with toasted crusty sourdough or gluten-free bread.',
      ],
      why: 'A comforting, fiber-loaded meal delivering slow-digesting complex carbs and natural antioxidants.',
      subs: [
        { if_missing: 'Cannellini beans', try_instead: 'Chickpeas or butter beans' },
        { if_missing: 'Baby spinach', try_instead: 'Lacinato kale or swiss chard' },
      ],
    },
    {
      name: 'Wild Atlantic Salmon with Garlic Asparagus & Sweet Potato',
      emoji: '🐟',
      dietOk: (d) => ['none', 'pescatarian', 'mediterranean', 'gluten-free', 'dairy-free', 'paleo'].includes(d),
      slots: ['dinner', 'lunch', 'any'],
      time: 30,
      difficulty: 'Medium',
      tags: ['Omega-3 Rich', 'High Protein', 'Brain Health', 'Gluten-Free'],
      ingredients: [
        '2 Salmon fillets (approx. 200g each)',
        '1 bunch Fresh asparagus, woody ends trimmed',
        '1 medium Sweet potato, peeled & cubed',
        '1.5 tbsp Avocado or olive oil',
        '2 cloves Garlic, crushed',
        '1 Lemon, sliced into rounds',
        'Sea salt & cracked black pepper',
      ],
      instructions: [
        'Preheat oven or air fryer to 200°C (400°F). Toss sweet potato cubes with 1/2 tbsp oil and roast for 12 minutes.',
        'Toss trimmed asparagus with remaining oil, crushed garlic, sea salt, and pepper.',
        'Place salmon fillets alongside asparagus and sweet potatoes. Top salmon with lemon slices.',
        'Bake for 12-14 minutes until salmon is tender and flakes easily with a fork.',
        'Plate with roasted sweet potato cubes and tender garlic asparagus.',
      ],
      why: 'Rich in essential Omega-3 fatty acids, vibrant carotenoids, and quality protein for cellular restoration.',
      subs: [
        { if_missing: 'Salmon', try_instead: 'Rainbow trout, arctic char, or firm white fish' },
        { if_missing: 'Sweet potato', try_instead: 'Roasted baby potatoes or butternut squash' },
      ],
    },
    {
      name: 'Creamy Avocado & Soft Herb Protein Scramble',
      emoji: '🍳',
      dietOk: (d) => ['none', 'vegetarian', 'pescatarian', 'mediterranean', 'keto', 'low-carb', 'gluten-free'].includes(d),
      slots: ['breakfast', 'snack', 'lunch', 'any'],
      time: 15,
      difficulty: 'Easy',
      tags: ['High Protein', 'Low Carb', 'Keto Friendly', 'Express 15m'],
      ingredients: [
        '3 Large pasture-raised eggs (or 1 cup liquid egg whites/tofu scramble)',
        '1/2 Ripe Hass avocado, sliced',
        '1 cup Baby spinach',
        '1 tbsp Olive oil or grass-fed butter',
        '2 tbsp Fresh chopped chives & dill',
        '1 tbsp Crumbled goat cheese or feta (optional)',
        'Pinch of smoked paprika & flake salt',
      ],
      instructions: [
        'Whisk eggs in a bowl with a pinch of salt, pepper, and 1 tbsp water until light and frothy.',
        'Melt butter or olive oil in a non-stick skillet over gentle medium-low heat.',
        'Add spinach for 30 seconds until wilted, then pour in whisked eggs.',
        'Gently fold the curds with a spatula for 2-3 minutes until soft and creamy.',
        'Transfer to plate, top with sliced avocado, fresh chopped herbs, and optional crumbled feta.',
      ],
      why: 'Fast high-protein fuel with healthy monounsaturated fats from fresh avocado to keep you focused and satisfied.',
      subs: [
        { if_missing: 'Avocado', try_instead: 'A drizzle of extra virgin olive oil and toasted pumpkin seeds' },
        { if_missing: 'Eggs', try_instead: 'Crumbled firm tofu seasoned with turmeric and nutritional yeast' },
      ],
    },
    {
      name: 'Rainbow Crunch Edamame & Peanut-Free Sesame Bowl',
      emoji: '🥑',
      dietOk: (d) => ['none', 'vegetarian', 'vegan', 'mediterranean', 'gluten-free', 'dairy-free'].includes(d),
      slots: ['lunch', 'dinner', 'any'],
      time: 20,
      difficulty: 'Easy',
      tags: ['Plant Protein', 'Crisp & Refreshing', 'Nut-Free', 'Meal Prep Star'],
      ingredients: [
        '1.5 cups Shelled edamame (steamed)',
        '1 cup Shredded red cabbage',
        '1 cup Shredded carrots',
        '1 Red bell pepper, thinly sliced',
        '1 cup Cooked jasmine rice or cold soba noodles',
        '2 tbsp Toasted sesame ginger dressing (soy sauce, sesame oil, rice vinegar, ginger)',
        '1 tbsp Toasted sesame seeds',
        '2 Green onions, sliced',
      ],
      instructions: [
        'Steam shelled edamame in boiling water for 4 minutes, then drain and rinse with cold water.',
        'In a large mixing bowl, combine shredded red cabbage, carrots, bell pepper, and warm steamed edamame.',
        'Whisk together tamari/soy sauce, toasted sesame oil, minced ginger, and rice vinegar.',
        'Toss the colorful vegetables with the dressing.',
        'Serve over jasmine rice or chilled noodles, topped with sliced scallions and toasted sesame seeds.',
      ],
      why: 'Loaded with plant-based protein from whole edamame and immune-supporting vitamin C from rainbow vegetables.',
      subs: [
        { if_missing: 'Edamame', try_instead: 'Crispy pan-fried tofu cubes or chickpeas' },
        { if_missing: 'Soba noodles', try_instead: 'Brown rice, quinoa, or rice vermicelli' },
      ],
    },
    {
      name: 'Hearty Golden Lentil & Vegetable Coconut Stew',
      emoji: '🍛',
      dietOk: (d) => ['none', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'mediterranean'].includes(d),
      slots: ['dinner', 'lunch', 'any'],
      time: 35,
      difficulty: 'Easy',
      tags: ['Warm & Comforting', 'Fiber Rich', 'Immune Support', 'Plant-Based'],
      ingredients: [
        '1 cup Dry red lentils, rinsed',
        '1 can (400ml) Light coconut milk',
        '2 cups Low-sodium vegetable broth',
        '1 medium Onion, diced',
        '2 Carrots, sliced',
        '2 cups Fresh kale or spinach',
        '1 tbsp Fresh grated ginger & turmeric (or powder)',
        '1 tsp Cumin & ground coriander',
      ],
      instructions: [
        'In a heavy-bottomed pot, sauté diced onion and carrots in 1 tbsp olive oil for 5 minutes.',
        'Stir in grated ginger, turmeric, ground cumin, and coriander for 1 minute until deeply fragrant.',
        'Add rinsed red lentils, coconut milk, and vegetable broth. Bring to a boil.',
        'Reduce heat to low, cover, and simmer for 20 minutes until lentils are velvety and tender.',
        'Stir in fresh greens in the final 2 minutes until wilted. Season with sea salt and fresh lime juice.',
      ],
      why: 'Deeply comforting and anti-inflammatory with whole lentils, warming spices, and rich velvety coconut broth.',
      subs: [
        { if_missing: 'Red lentils', try_instead: 'Brown lentils or canned chickpeas' },
        { if_missing: 'Coconut milk', try_instead: 'Extra vegetable broth with 1 tbsp cashew butter or olive oil' },
      ],
    },
  ];

  // Filter templates matching diet, allergies, dislikes, time, and slot
  let candidates = templates.filter((t) => {
    if (!t.dietOk(diet)) return false;
    // Check allergy conflict
    if (t.ingredients.some(hasAllergy)) return false;
    return true;
  });

  // If slot specified, prefer that slot
  const slotCandidates = candidates.filter((t) => t.slots.includes(mealType));
  if (slotCandidates.length > 0) {
    candidates = slotCandidates;
  }

  // If no candidates due to strict constraints, relax non-allergy checks
  if (candidates.length === 0) {
    candidates = templates.filter((t) => !t.ingredients.some(hasAllergy));
  }

  // Select a match or customize with user cravings
  const chosen = candidates[Math.floor(Math.random() * candidates.length)] || templates[0];

  // Adjust time if override provided
  const finalTime = Math.min(time, chosen.time);

  // Customize description if user provided custom cravings
  let customizedWhy = chosen.why;
  if (context.cravings_or_notes) {
    customizedWhy = `Custom-tailored for your craving (${context.cravings_or_notes}) — ${chosen.why}`;
  }

  return {
    id: 'meal_ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    meal_name: chosen.name,
    emoji: chosen.emoji,
    time_minutes: finalTime,
    difficulty: chosen.difficulty,
    nutrition_tags: chosen.tags,
    ingredients: chosen.ingredients.filter((ing) => !hasAllergy(ing)),
    instructions: chosen.instructions,
    why_this_meal: customizedWhy,
    substitutions: chosen.subs,
    category: (context.meal_type as any) || 'dinner',
    created_at: new Date().toISOString(),
  };
}

function generateDynamicCookWithPantry(
  profile: UserProfile,
  preferences: FoodPreference[],
  ingredients: string[],
  notes?: string
): Meal[] {
  const allergies = preferences
    .filter((p) => p.preference_type === 'allergy')
    .map((p) => p.food_name.toLowerCase());
  const hasAllergy = (ing: string) => allergies.some((a) => ing.toLowerCase().includes(a));

  const safeIngredients = ingredients.filter((ing) => !hasAllergy(ing));
  const ingListStr = safeIngredients.slice(0, 4).join(', ') || 'kitchen pantry staples';

  const meal1: Meal = {
    id: 'meal_pantry_1_' + Date.now(),
    meal_name: `Skillet Sauté with ${safeIngredients[0] || 'Fresh Greens'} & Aromatics`,
    emoji: '🍳',
    time_minutes: 20,
    difficulty: 'Easy',
    nutrition_tags: ['Pantry Creation', 'Zero Waste', 'Quick 20m', 'Custom Crafted'],
    ingredients: [
      ...safeIngredients.map((ing) => `1 portion ${ing}`),
      '2 tbsp Olive oil or butter',
      '2 cloves Garlic, minced',
      'Salt & black pepper to taste',
      'Squeeze of fresh lemon juice',
    ],
    instructions: [
      `Prep and chop your available ingredients (${safeIngredients.join(', ')}).`,
      'Heat olive oil in a wide skillet over medium heat and sauté minced garlic for 1 minute.',
      `Add your firmer ingredients first, cooking for 4-5 minutes, then add more delicate ingredients.`,
      'Season with salt, freshly ground black pepper, and fresh lemon juice.',
      'Serve warm immediately as a balanced one-pan meal.',
    ],
    why_this_meal: `Designed to maximize your available ingredients (${ingListStr}) with zero food waste.`,
    substitutions: [
      { if_missing: 'Garlic', try_instead: 'Shallots, onion powder, or scallions' },
      { if_missing: 'Lemon juice', try_instead: 'Apple cider vinegar or balsamic glaze' },
    ],
    category: 'dinner',
    created_at: new Date().toISOString(),
  };

  const meal2: Meal = {
    id: 'meal_pantry_2_' + Date.now(),
    meal_name: `Hearty Nourish Bowl with ${safeIngredients.slice(0, 2).join(' & ') || 'Seasonal Veggies'}`,
    emoji: '🥗',
    time_minutes: 25,
    difficulty: 'Easy',
    nutrition_tags: ['Nutrient-Dense', 'Custom Bowl', 'Fiber-Rich', 'Easy Prep'],
    ingredients: [
      ...safeIngredients.map((ing) => `1 cup ${ing}`),
      '1 cup Cooked rice, quinoa, or salad greens base',
      '1.5 tbsp Extra virgin olive oil or favorite vinaigrette',
      '1 tbsp Toasted seeds or nuts (if permitted)',
    ],
    instructions: [
      'Prepare a base of warm grains or crisp greens in a wide bowl.',
      `Lightly roast or pan-sear your ingredients (${ingListStr}) until tender and aromatic.`,
      'Arrange the prepared ingredients in sections over your base for vibrant visual appeal.',
      'Drizzle with olive oil or vinaigrette and finish with a pinch of flaky salt.',
    ],
    why_this_meal: `Combines your ingredients into a satisfying, balanced meal with plenty of texture and nutrients.`,
    substitutions: [
      { if_missing: 'Grain base', try_instead: 'Cauliflower rice, shredded cabbage, or roasted sweet potato' },
    ],
    category: 'lunch',
    created_at: new Date().toISOString(),
  };

  const meal3: Meal = {
    id: 'meal_pantry_3_' + Date.now(),
    meal_name: `Warm Simmered Medley with ${safeIngredients[0] || 'Herbs'} & Spices`,
    emoji: '🍲',
    time_minutes: 30,
    difficulty: 'Medium',
    nutrition_tags: ['Comfort Food', 'Warm & Savory', 'Pantry Champion'],
    ingredients: [
      ...safeIngredients.map((ing) => `1.5 cups ${ing}`),
      '1.5 cups Vegetable broth or water',
      '1 tbsp Tomato paste or soy sauce',
      '1 tsp Mixed Italian herbs or curry powder',
      '1 tbsp Cooking oil',
    ],
    instructions: [
      'Heat oil in a medium saucepan and lightly brown your available ingredients.',
      'Stir in herbs/spices and tomato paste or seasonings for 1 minute.',
      'Pour in broth, bring to a gentle simmer, and cook for 15-20 minutes until flavors harmonize.',
      'Taste and adjust seasoning with salt, pepper, and herbs before serving warm.',
    ],
    why_this_meal: `A cozy, flavorful way to bring together ${ingListStr} into a cohesive dish.`,
    substitutions: [
      { if_missing: 'Broth', try_instead: 'Water with a pinch of salt and a bay leaf or bouillon cube' },
    ],
    category: 'dinner',
    created_at: new Date().toISOString(),
  };

  return [meal1, meal2, meal3];
}

// -------------------------------------------------------------
// EXPORTED GENERATION FUNCTIONS
// -------------------------------------------------------------

export async function generateSingleMeal(
  profile: UserProfile,
  preferences: FoodPreference[],
  context: {
    meal_type?: string;
    available_ingredients?: string[];
    override_time?: number;
    cravings_or_notes?: string;
    custom_goal?: string;
  }
): Promise<Meal> {
  const cacheKey = getCacheKey('single_meal', { profile, preferences, context });
  const cached = getFromCache<Meal>(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = getAiClient();

  if (ai) {
    const prompt = formatUserPrompt(profile, preferences, { ...context, is_multi: false });

    // Try candidate models in order of resilience
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: SINGLE_MEAL_SCHEMA,
            temperature: 0.7,
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(cleanJsonString(rawText));

        if (validateMealObject(parsed)) {
          const fullMeal: Meal = {
            ...parsed,
            id: 'meal_ai_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            category: (context.meal_type as any) || 'dinner',
            created_at: new Date().toISOString(),
          };
          setInCache(cacheKey, fullMeal);
          return fullMeal;
        }
      } catch (err) {
        console.warn(`Gemini generation on model ${modelName} encountered issue:`, err);
      }
    }
  }

  // Graceful intelligent dynamic fallback
  const fallbackMeal = generateDynamicPersonalizedMeal(profile, preferences, context);
  setInCache(cacheKey, fallbackMeal);
  return fallbackMeal;
}

export async function generateCookWithIngredients(
  profile: UserProfile,
  preferences: FoodPreference[],
  ingredients: string[],
  notes?: string
): Promise<Meal[]> {
  const cacheKey = getCacheKey('cook_with_ingredients', { profile, preferences, ingredients, notes });
  const cached = getFromCache<Meal[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const ai = getAiClient();

  if (ai) {
    const prompt = formatUserPrompt(profile, preferences, {
      available_ingredients: ingredients,
      cravings_or_notes: notes,
      is_multi: true,
    });

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: MULTI_MEAL_SCHEMA,
            temperature: 0.7,
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(cleanJsonString(rawText));

        if (Array.isArray(parsed) && parsed.length > 0) {
          const validMeals: Meal[] = parsed
            .filter(validateMealObject)
            .map((m, idx) => ({
              ...m,
              id: 'meal_ai_pantry_' + Date.now() + '_' + idx,
              created_at: new Date().toISOString(),
            }));

          if (validMeals.length > 0) {
            setInCache(cacheKey, validMeals);
            return validMeals;
          }
        }
      } catch (err) {
        console.warn(`Cook with ingredients on model ${modelName} encountered issue:`, err);
      }
    }
  }

  // Graceful intelligent fallback with pantry ingredients
  const fallbackMeals = generateDynamicCookWithPantry(profile, preferences, ingredients, notes);
  setInCache(cacheKey, fallbackMeals);
  return fallbackMeals;
}

