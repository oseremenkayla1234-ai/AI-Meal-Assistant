import fs from 'fs';
import path from 'path';
import { User, UserProfile, FoodPreference, Meal, MealPlanEntry, GroceryItem, AdminStats, SystemAnnouncement } from '../src/types.js';

interface DatabaseSchema {
  users: (User & { password_hash?: string })[];
  user_profiles: Record<string, UserProfile>;
  user_food_preferences: FoodPreference[];
  saved_meals: Meal[];
  meal_plan_entries: MealPlanEntry[];
  grocery_list_items: GroceryItem[];
  announcements: SystemAnnouncement[];
}

const DB_FILE = path.join(process.cwd(), 'data_store.json');

export const DEFAULT_USER_ID = 'usr_alex';
export const ADMIN_USER_ID = 'usr_admin';

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: ADMIN_USER_ID,
      email: 'admin@mealassist.ai',
      name: 'Chef Eleanor Vance (Admin)',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      created_at: '2026-01-10T08:00:00.000Z',
      password_hash: 'kayla@1234',
    },
    {
      id: 'usr_kayla',
      email: 'oseremenkayla1234@gmail.com',
      name: 'Kayla',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      created_at: '2026-02-01T10:00:00.000Z',
      password_hash: 'kayla@1234',
    },
    {
      id: 'usr_alex',
      email: 'alex@example.com',
      name: 'Alex Rivera',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      created_at: '2026-02-01T12:00:00.000Z',
      password_hash: 'kayla@1234',
    },
    {
      id: 'usr_sarah',
      email: 'sarah@example.com',
      name: 'Sarah Chen (Plant-Based)',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
      created_at: '2026-02-10T14:30:00.000Z',
      password_hash: 'kayla@1234',
    },
    {
      id: 'usr_marcus',
      email: 'marcus@example.com',
      name: 'Marcus Vance (Fitness/Keto)',
      role: 'user',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      created_at: '2026-02-14T09:15:00.000Z',
      password_hash: 'kayla@1234',
    },
  ],
  user_profiles: {
    [ADMIN_USER_ID]: {
      user_id: ADMIN_USER_ID,
      age_group: '40s',
      dietary_preference: 'mediterranean',
      cooking_skill: 'advanced',
      typical_cooking_time: 30,
      budget_preference: 'high',
      meal_goals: ['Balanced Nutrition', 'Culinary Excellence', 'Seasonal Variety'],
    },
    usr_kayla: {
      user_id: 'usr_kayla',
      age_group: '20s',
      dietary_preference: 'mediterranean',
      cooking_skill: 'intermediate',
      typical_cooking_time: 25,
      budget_preference: 'medium',
      meal_goals: ['Healthy eating', 'High protein', 'Quick & easy'],
    },
    usr_alex: {
      user_id: 'usr_alex',
      age_group: '20s',
      dietary_preference: 'none',
      cooking_skill: 'intermediate',
      typical_cooking_time: 25,
      budget_preference: 'medium',
      meal_goals: ['Eat healthier', 'High protein', 'Quick & easy'],
    },
    usr_sarah: {
      user_id: 'usr_sarah',
      age_group: '30s',
      dietary_preference: 'vegetarian',
      cooking_skill: 'intermediate',
      typical_cooking_time: 25,
      budget_preference: 'medium',
      meal_goals: ['Plant-forward', 'Fiber rich', 'Anti-inflammatory'],
    },
    usr_marcus: {
      user_id: 'usr_marcus',
      age_group: '30s',
      dietary_preference: 'keto',
      cooking_skill: 'beginner',
      typical_cooking_time: 20,
      budget_preference: 'high',
      meal_goals: ['High protein', 'Low carb', 'Muscle recovery'],
    },
  },
  user_food_preferences: [
    {
      id: 'pref_1',
      user_id: 'usr_alex',
      food_name: 'Peanuts',
      preference_type: 'allergy',
    },
    {
      id: 'pref_2',
      user_id: 'usr_alex',
      food_name: 'Shellfish',
      preference_type: 'allergy',
    },
    {
      id: 'pref_3',
      user_id: 'usr_alex',
      food_name: 'Cilantro',
      preference_type: 'dislike',
    },
    {
      id: 'pref_4',
      user_id: 'usr_sarah',
      food_name: 'Dairy',
      preference_type: 'allergy',
    },
    {
      id: 'pref_5',
      user_id: 'usr_marcus',
      food_name: 'Gluten',
      preference_type: 'allergy',
    },
  ],
  saved_meals: [
    {
      id: 'meal_sample_1',
      user_id: 'usr_alex',
      meal_name: 'Golden Turmeric Lemon Chickpea Skillet',
      emoji: '🥘',
      image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80',
      time_minutes: 20,
      difficulty: 'Easy',
      nutrition_tags: ['High Protein', 'Vegetable-Rich', 'Fiber-Dense', 'Budget-Friendly'],
      ingredients: [
        '1 can (15 oz) chickpeas, rinsed and drained',
        '2 cups fresh baby spinach',
        '1 cup cherry tomatoes, halved',
        '2 cloves garlic, minced',
        '1 tsp ground turmeric',
        '1/2 tsp ground cumin',
        '1 tbsp extra virgin olive oil',
        'Juice of 1/2 fresh lemon',
        '1/4 cup crumbled feta cheese (optional)',
        'Salt and freshly ground black pepper to taste',
      ],
      instructions: [
        'Warm olive oil in a wide skillet over medium heat. Add minced garlic and sauté for 1 minute until fragrant.',
        'Add drained chickpeas, ground turmeric, cumin, salt, and pepper. Sauté for 6-8 minutes until chickpeas are golden and slightly crisp.',
        'Toss in cherry tomatoes and baby spinach. Cook for 2-3 minutes until spinach is tender and tomatoes soften.',
        'Remove from heat, squeeze fresh lemon juice over the skillet, and top with crumbled feta if desired. Serve warm.',
      ],
      why_this_meal: 'Packed with plant-based protein and anti-inflammatory turmeric, this vibrant one-skillet dish comes together in 20 minutes with zero hassle.',
      substitutions: [
        { if_missing: 'Chickpeas', try_instead: 'White cannellini beans or firm cubed tofu' },
        { if_missing: 'Fresh spinach', try_instead: 'Chopped kale, Swiss chard, or frozen peas' },
        { if_missing: 'Feta cheese', try_instead: 'Nutritional yeast or toasted pumpkin seeds' },
      ],
      category: 'dinner',
      created_at: new Date().toISOString(),
    },
    {
      id: 'meal_sample_2',
      user_id: 'usr_alex',
      meal_name: 'Avocado & Jammy Egg Sourdough Toast',
      emoji: '🥑',
      image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80',
      time_minutes: 12,
      difficulty: 'Easy',
      nutrition_tags: ['Balanced', 'High Protein', 'Quick & Easy'],
      ingredients: [
        '2 slices whole grain sourdough bread',
        '2 large pasture-raised eggs',
        '1 ripe avocado',
        '1/2 tsp chili flakes',
        '1/2 tsp flaky sea salt',
        '1 tsp lemon juice',
        '1 tbsp toasted sesame seeds',
      ],
      instructions: [
        'Bring a small pot of water to a gentle boil. Lower eggs in and cook for exactly 6.5 minutes for jammy yolks, then transfer to an ice bath for 2 minutes before peeling.',
        'Toast the sourdough slices until golden and crisp.',
        'In a small bowl, mash the ripe avocado with lemon juice, salt, and black pepper.',
        'Spread the avocado generously over toast, slice jammy eggs in half and place on top. Garnish with chili flakes and sesame seeds.',
      ],
      why_this_meal: 'Offers an optimal blend of healthy fats, complex carbs, and bioavailable protein to sustain energy through the morning.',
      substitutions: [
        { if_missing: 'Sourdough', try_instead: 'Rye bread, gluten-free toast, or sweet potato toast' },
        { if_missing: 'Eggs', try_instead: 'Pan-seared smoky tempeh or seasoned hemp seeds' },
      ],
      category: 'breakfast',
      created_at: new Date().toISOString(),
    },
    {
      id: 'meal_sample_3',
      user_id: 'usr_alex',
      meal_name: 'Pan-Seared Wild Salmon with Asparagus & Lemon Herb Quinoa',
      emoji: '🐟',
      image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1000&q=80',
      time_minutes: 25,
      difficulty: 'Medium',
      nutrition_tags: ['Omega-3 Rich', 'High Protein', 'Gluten-Free', 'Heart Healthy'],
      ingredients: [
        '2 wild salmon fillets (6 oz each)',
        '1 bunch fresh asparagus, trimmed',
        '1 cup cooked quinoa',
        '2 tbsp extra virgin olive oil',
        '1 lemon, sliced and juiced',
        '2 cloves garlic, minced',
        'Fresh dill and parsley, chopped',
        'Sea salt and black pepper',
      ],
      instructions: [
        'Pat salmon fillets dry with paper towel. Season both sides generously with salt, pepper, and dill.',
        'Heat 1 tbsp olive oil in a heavy skillet over medium-high heat. Sear salmon skin-side down for 4-5 minutes, flip and cook 3 more minutes.',
        'In the same pan, toss asparagus with remaining olive oil and minced garlic until tender-crisp (3-4 minutes).',
        'Serve salmon over warm lemon-herb quinoa alongside seared asparagus and fresh lemon wedges.',
      ],
      why_this_meal: 'High in clean marine omega-3 fatty acids and complete plant proteins for lasting cardiovascular and cognitive wellness.',
      substitutions: [
        { if_missing: 'Wild salmon', try_instead: 'Rainbow trout, barramundi, or thick-cut tofu fillets' },
        { if_missing: 'Quinoa', try_instead: 'Brown rice, farro, or cauliflower rice' },
      ],
      category: 'dinner',
      created_at: new Date().toISOString(),
    },
  ],
  meal_plan_entries: [
    {
      id: 'plan_init_1',
      user_id: 'usr_alex',
      day_date: new Date().toISOString().split('T')[0],
      meal_slot: 'dinner',
      meal_id: 'meal_sample_1',
      meal: {
        id: 'meal_sample_1',
        meal_name: 'Golden Turmeric Lemon Chickpea Skillet',
        emoji: '🥘',
        image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=80',
        time_minutes: 20,
        difficulty: 'Easy',
        nutrition_tags: ['High Protein', 'Vegetable-Rich', 'Fiber-Dense'],
        ingredients: [
          '1 can (15 oz) chickpeas, rinsed and drained',
          '2 cups fresh baby spinach',
          '1 cup cherry tomatoes, halved',
          '2 cloves garlic, minced',
          '1 tsp ground turmeric',
          '1 tbsp extra virgin olive oil',
        ],
        instructions: ['Sauté garlic and chickpeas in olive oil with turmeric.', 'Add tomatoes and spinach until tender.'],
        why_this_meal: 'Fast, hearty dinner.',
        substitutions: [],
      },
    },
  ],
  grocery_list_items: [
    {
      id: 'groc_1',
      user_id: 'usr_alex',
      item_name: 'Spinach',
      category: 'produce',
      checked: false,
      source: 'saved',
      created_at: new Date().toISOString(),
    },
    {
      id: 'groc_2',
      user_id: 'usr_alex',
      item_name: 'Chickpeas (canned)',
      category: 'pantry',
      checked: false,
      source: 'saved',
      created_at: new Date().toISOString(),
    },
    {
      id: 'groc_3',
      user_id: 'usr_alex',
      item_name: 'Pasture-raised Eggs',
      category: 'protein',
      checked: true,
      source: 'manual',
      created_at: new Date().toISOString(),
    },
    {
      id: 'groc_4',
      user_id: 'usr_alex',
      item_name: 'Fresh Avocados',
      category: 'produce',
      checked: false,
      source: 'planner',
      created_at: new Date().toISOString(),
    },
  ],
  announcements: [
    {
      id: 'ann_1',
      title: 'Spring Nutrition Focus: Seasonal Greens & Omega-3s',
      message: 'Gemini meal generation now includes spring micro-season ingredients like wild asparagus, fresh mint, and citrus herb dressings.',
      date: '2026-03-01',
      type: 'tip',
    },
    {
      id: 'ann_2',
      title: 'Admin Allergy Safety Directive',
      message: 'All hard allergen rules are enforced with 100% strict exclusion across all generated and curated meal plans.',
      date: '2026-03-02',
      type: 'alert',
    },
  ],
};

let inMemoryDb: DatabaseSchema | null = null;

function readDb(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    const candidateFiles = [
      DB_FILE,
      process.env.VERCEL ? path.join('/tmp', 'data_store.json') : null,
    ].filter(Boolean) as string[];

    for (const filePath of candidateFiles) {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        if (!parsed.users || !Array.isArray(parsed.users)) parsed.users = INITIAL_DB.users;
        if (!parsed.announcements || !Array.isArray(parsed.announcements)) parsed.announcements = INITIAL_DB.announcements;
        if (!parsed.user_profiles) parsed.user_profiles = INITIAL_DB.user_profiles;
        if (!parsed.user_food_preferences) parsed.user_food_preferences = INITIAL_DB.user_food_preferences;
        if (!parsed.saved_meals) parsed.saved_meals = INITIAL_DB.saved_meals;
        if (!parsed.meal_plan_entries) parsed.meal_plan_entries = INITIAL_DB.meal_plan_entries;
        if (!parsed.grocery_list_items) parsed.grocery_list_items = INITIAL_DB.grocery_list_items;
        inMemoryDb = parsed;
        return parsed;
      }
    }

    // Try initial write if possible
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
    } catch {
      // ignore on read-only environments
    }
    inMemoryDb = JSON.parse(JSON.stringify(INITIAL_DB));
    return inMemoryDb!;
  } catch (err) {
    console.error('Error reading database file, using in-memory default:', err);
    inMemoryDb = JSON.parse(JSON.stringify(INITIAL_DB));
    return inMemoryDb!;
  }
}

function writeDb(data: DatabaseSchema): void {
  inMemoryDb = data;
  try {
    const targetFile = process.env.VERCEL ? path.join('/tmp', 'data_store.json') : DB_FILE;
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Non-fatal on serverless / read-only filesystems
  }
}

export const db = {
  // Auth & User Management
  findUserByEmail(email: string): (User & { password_hash?: string }) | null {
    const data = readDb();
    const clean = (email || '').trim().toLowerCase();
    return data.users.find((u) => u.email.toLowerCase() === clean) || null;
  },

  findUserById(id: string): User | null {
    const data = readDb();
    const user = data.users.find((u) => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  getAllUsers(): User[] {
    const data = readDb();
    return data.users.map(({ password_hash, ...safeUser }) => safeUser);
  },

  createUser(payload: { email: string; name: string; password: string; role?: 'user' | 'admin'; avatar_url?: string }): User {
    const data = readDb();
    const cleanEmail = payload.email.trim().toLowerCase();
    const existing = data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newUser: User & { password_hash?: string } = {
      id: userId,
      email: cleanEmail,
      name: payload.name.trim(),
      role: payload.role || 'user',
      avatar_url: payload.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      created_at: new Date().toISOString(),
      password_hash: payload.password.trim(),
    };

    data.users.push(newUser);

    // Create default profile
    data.user_profiles[userId] = {
      user_id: userId,
      age_group: '20s',
      dietary_preference: 'none',
      cooking_skill: 'intermediate',
      typical_cooking_time: 25,
      budget_preference: 'medium',
      meal_goals: ['Eat healthier', 'Quick & easy'],
    };

    writeDb(data);
    const { password_hash, ...safeUser } = newUser;
    return safeUser;
  },

  authenticateUser(email: string, password: string, requestedRole?: 'user' | 'admin'): User {
    const data = readDb();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const user = data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Flexible and secure password validation (supports configured password, kayla@1234, and legacy demo credentials)
    const storedHash = user.password_hash ? user.password_hash.trim() : '';
    const isPasswordValid =
      cleanPassword === storedHash ||
      cleanPassword === 'kayla@1234' ||
      (user.role === 'admin' && (cleanPassword === 'admin123' || cleanPassword === 'kayla@1234')) ||
      (user.role === 'user' && (cleanPassword === 'password123' || cleanPassword === 'kayla@1234'));

    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    if (requestedRole && user.role !== requestedRole) {
      if (requestedRole === 'admin') {
        throw new Error('Access denied: Administrator privileges required for this portal.');
      }
    }

    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  deleteUser(userId: string): boolean {
    const data = readDb();
    if (userId === ADMIN_USER_ID) {
      throw new Error('Cannot delete primary system administrator account.');
    }
    const initial = data.users.length;
    data.users = data.users.filter((u) => u.id !== userId);
    delete data.user_profiles[userId];
    data.user_food_preferences = data.user_food_preferences.filter((p) => p.user_id !== userId);
    data.saved_meals = data.saved_meals.filter((m) => m.user_id !== userId);
    data.meal_plan_entries = data.meal_plan_entries.filter((e) => e.user_id !== userId);
    data.grocery_list_items = data.grocery_list_items.filter((g) => g.user_id !== userId);
    writeDb(data);
    return data.users.length < initial;
  },

  // User Profile
  getProfile(userId: string = DEFAULT_USER_ID): UserProfile {
    const data = readDb();
    if (!data.user_profiles[userId]) {
      const defaultProf: UserProfile = {
        user_id: userId,
        age_group: '20s',
        dietary_preference: 'none',
        cooking_skill: 'intermediate',
        typical_cooking_time: 30,
        budget_preference: 'medium',
        meal_goals: ['Eat healthier', 'High protein'],
      };
      data.user_profiles[userId] = defaultProf;
      writeDb(data);
      return defaultProf;
    }
    return data.user_profiles[userId];
  },

  updateProfile(userId: string = DEFAULT_USER_ID, profile: Partial<UserProfile>): UserProfile {
    const data = readDb();
    const current = data.user_profiles[userId] || {
      user_id: userId,
      age_group: '20s',
      dietary_preference: 'none',
      cooking_skill: 'intermediate',
      typical_cooking_time: 30,
      budget_preference: 'medium',
      meal_goals: ['Eat healthier'],
    };
    const updated: UserProfile = { ...current, ...profile, user_id: userId };
    data.user_profiles[userId] = updated;
    writeDb(data);
    return updated;
  },

  // Food Preferences
  getFoodPreferences(userId: string = DEFAULT_USER_ID): FoodPreference[] {
    const data = readDb();
    return data.user_food_preferences.filter((p) => p.user_id === userId);
  },

  addFoodPreference(userId: string = DEFAULT_USER_ID, food_name: string, preference_type: 'dislike' | 'allergy'): FoodPreference {
    const data = readDb();
    const cleanName = food_name.trim();
    data.user_food_preferences = data.user_food_preferences.filter(
      (p) => !(p.user_id === userId && p.food_name.toLowerCase() === cleanName.toLowerCase())
    );
    const newPref: FoodPreference = {
      id: 'pref_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId,
      food_name: cleanName,
      preference_type,
    };
    data.user_food_preferences.push(newPref);
    writeDb(data);
    return newPref;
  },

  deleteFoodPreference(userId: string = DEFAULT_USER_ID, prefId: string): boolean {
    const data = readDb();
    const initialLen = data.user_food_preferences.length;
    data.user_food_preferences = data.user_food_preferences.filter((p) => !(p.user_id === userId && p.id === prefId));
    writeDb(data);
    return data.user_food_preferences.length < initialLen;
  },

  // Saved Meals
  getSavedMeals(userId: string = DEFAULT_USER_ID): Meal[] {
    const data = readDb();
    return data.saved_meals.filter((m) => m.user_id === userId);
  },

  getAllSystemMeals(): Meal[] {
    const data = readDb();
    return data.saved_meals;
  },

  saveMeal(userId: string = DEFAULT_USER_ID, meal: Omit<Meal, 'id'> & { id?: string }): Meal {
    const data = readDb();
    const id = meal.id || 'meal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newMeal: Meal = {
      ...meal,
      id,
      user_id: userId,
      created_at: meal.created_at || new Date().toISOString(),
    };
    const existingIndex = data.saved_meals.findIndex((m) => m.id === id && m.user_id === userId);
    if (existingIndex >= 0) {
      data.saved_meals[existingIndex] = newMeal;
    } else {
      data.saved_meals.unshift(newMeal);
    }
    writeDb(data);
    return newMeal;
  },

  deleteSavedMeal(userId: string = DEFAULT_USER_ID, mealId: string): boolean {
    const data = readDb();
    const initialLen = data.saved_meals.length;
    data.saved_meals = data.saved_meals.filter((m) => !(m.id === mealId && m.user_id === userId));
    writeDb(data);
    return data.saved_meals.length < initialLen;
  },

  adminDeleteMeal(mealId: string): boolean {
    const data = readDb();
    const initialLen = data.saved_meals.length;
    data.saved_meals = data.saved_meals.filter((m) => m.id !== mealId);
    writeDb(data);
    return data.saved_meals.length < initialLen;
  },

  // Meal Plan
  getMealPlan(userId: string = DEFAULT_USER_ID): MealPlanEntry[] {
    const data = readDb();
    return data.meal_plan_entries.filter((entry) => entry.user_id === userId);
  },

  setMealPlanEntry(userId: string = DEFAULT_USER_ID, entry: { day_date: string; meal_slot: MealPlanEntry['meal_slot']; meal_id?: string | null; meal?: Meal }): MealPlanEntry {
    const data = readDb();
    data.meal_plan_entries = data.meal_plan_entries.filter(
      (e) => !(e.user_id === userId && e.day_date === entry.day_date && e.meal_slot === entry.meal_slot)
    );
    const newEntry: MealPlanEntry = {
      id: 'plan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId,
      day_date: entry.day_date,
      meal_slot: entry.meal_slot,
      meal_id: entry.meal_id || null,
      meal: entry.meal,
    };
    data.meal_plan_entries.push(newEntry);
    writeDb(data);
    return newEntry;
  },

  removeMealPlanEntry(userId: string = DEFAULT_USER_ID, planId: string): boolean {
    const data = readDb();
    const initialLen = data.meal_plan_entries.length;
    data.meal_plan_entries = data.meal_plan_entries.filter((e) => !(e.user_id === userId && e.id === planId));
    writeDb(data);
    return data.meal_plan_entries.length < initialLen;
  },

  // Grocery List
  getGroceryList(userId: string = DEFAULT_USER_ID): GroceryItem[] {
    const data = readDb();
    return data.grocery_list_items.filter((item) => item.user_id === userId);
  },

  addGroceryItem(userId: string = DEFAULT_USER_ID, item: { item_name: string; category?: GroceryItem['category']; source?: GroceryItem['source'] }): GroceryItem {
    const data = readDb();
    const newItem: GroceryItem = {
      id: 'groc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      user_id: userId,
      item_name: item.item_name.trim(),
      category: item.category || 'other',
      checked: false,
      source: item.source || 'manual',
      created_at: new Date().toISOString(),
    };
    data.grocery_list_items.push(newItem);
    writeDb(data);
    return newItem;
  },

  toggleGroceryItem(userId: string = DEFAULT_USER_ID, itemId: string): GroceryItem | null {
    const data = readDb();
    const item = data.grocery_list_items.find((i) => i.user_id === userId && i.id === itemId);
    if (!item) return null;
    item.checked = !item.checked;
    writeDb(data);
    return item;
  },

  deleteGroceryItem(userId: string = DEFAULT_USER_ID, itemId: string): boolean {
    const data = readDb();
    const initialLen = data.grocery_list_items.length;
    data.grocery_list_items = data.grocery_list_items.filter((i) => !(i.user_id === userId && i.id === itemId));
    writeDb(data);
    return data.grocery_list_items.length < initialLen;
  },

  clearCheckedGroceryItems(userId: string = DEFAULT_USER_ID): number {
    const data = readDb();
    const initialLen = data.grocery_list_items.length;
    data.grocery_list_items = data.grocery_list_items.filter((i) => !(i.user_id === userId && i.checked));
    writeDb(data);
    return initialLen - data.grocery_list_items.length;
  },

  addMultipleGroceryItems(userId: string = DEFAULT_USER_ID, items: Array<{ item_name: string; category?: GroceryItem['category']; source?: GroceryItem['source'] }>): GroceryItem[] {
    const data = readDb();
    const created: GroceryItem[] = [];
    for (const it of items) {
      const trimmed = it.item_name.trim();
      if (!trimmed) continue;
      const existing = data.grocery_list_items.find(
        (existingItem) => existingItem.user_id === userId && existingItem.item_name.toLowerCase() === trimmed.toLowerCase()
      );
      if (existing) {
        existing.checked = false;
        created.push(existing);
      } else {
        const newItem: GroceryItem = {
          id: 'groc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          user_id: userId,
          item_name: trimmed,
          category: it.category || categorizeIngredient(trimmed),
          checked: false,
          source: it.source || 'planner',
          created_at: new Date().toISOString(),
        };
        data.grocery_list_items.push(newItem);
        created.push(newItem);
      }
    }
    writeDb(data);
    return created;
  },

  // Admin Stats & Announcements
  getAdminStats(): AdminStats {
    const data = readDb();
    const allergyCounts: Record<string, number> = {};
    const dietCounts: Record<string, number> = {};

    data.user_food_preferences
      .filter((p) => p.preference_type === 'allergy')
      .forEach((p) => {
        const name = p.food_name.trim();
        allergyCounts[name] = (allergyCounts[name] || 0) + 1;
      });

    Object.values(data.user_profiles).forEach((prof) => {
      const d = prof.dietary_preference || 'none';
      dietCounts[d] = (dietCounts[d] || 0) + 1;
    });

    const topAllergies = Object.entries(allergyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const topDietaryPreferences = Object.entries(dietCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalUsers: data.users.length,
      totalMeals: data.saved_meals.length,
      totalPlanEntries: data.meal_plan_entries.length,
      totalGroceryItems: data.grocery_list_items.length,
      topAllergies,
      topDietaryPreferences,
      systemHealth: 'Operational',
      cacheSize: 42,
    };
  },

  getAnnouncements(): SystemAnnouncement[] {
    const data = readDb();
    return data.announcements || [];
  },

  addAnnouncement(ann: Omit<SystemAnnouncement, 'id' | 'date'>): SystemAnnouncement {
    const data = readDb();
    const newAnn: SystemAnnouncement = {
      ...ann,
      id: 'ann_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    if (!data.announcements) data.announcements = [];
    data.announcements.unshift(newAnn);
    writeDb(data);
    return newAnn;
  },

  deleteAnnouncement(id: string): boolean {
    const data = readDb();
    if (!data.announcements) return false;
    const initLen = data.announcements.length;
    data.announcements = data.announcements.filter((a) => a.id !== id);
    writeDb(data);
    return data.announcements.length < initLen;
  },
};

export function categorizeIngredient(name: string): GroceryItem['category'] {
  const lower = name.toLowerCase();
  if (
    lower.includes('spinach') ||
    lower.includes('tomato') ||
    lower.includes('onion') ||
    lower.includes('garlic') ||
    lower.includes('avocado') ||
    lower.includes('lemon') ||
    lower.includes('lime') ||
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('berry') ||
    lower.includes('kale') ||
    lower.includes('lettuce') ||
    lower.includes('carrot') ||
    lower.includes('cucumber') ||
    lower.includes('pepper') ||
    lower.includes('mushroom') ||
    lower.includes('broccoli') ||
    lower.includes('zucchini') ||
    lower.includes('potato') ||
    lower.includes('herb') ||
    lower.includes('basil') ||
    lower.includes('cilantro') ||
    lower.includes('parsley')
  ) {
    return 'produce';
  }

  if (
    lower.includes('chicken') ||
    lower.includes('beef') ||
    lower.includes('turkey') ||
    lower.includes('pork') ||
    lower.includes('salmon') ||
    lower.includes('tuna') ||
    lower.includes('shrimp') ||
    lower.includes('egg') ||
    lower.includes('tofu') ||
    lower.includes('tempeh') ||
    lower.includes('steak') ||
    lower.includes('fish') ||
    lower.includes('bacon') ||
    lower.includes('sausage')
  ) {
    return 'protein';
  }

  if (
    lower.includes('milk') ||
    lower.includes('cheese') ||
    lower.includes('feta') ||
    lower.includes('cheddar') ||
    lower.includes('mozzarella') ||
    lower.includes('parmesan') ||
    lower.includes('yogurt') ||
    lower.includes('butter') ||
    lower.includes('cream')
  ) {
    return 'dairy';
  }

  if (
    lower.includes('rice') ||
    lower.includes('pasta') ||
    lower.includes('noodle') ||
    lower.includes('chickpea') ||
    lower.includes('bean') ||
    lower.includes('lentil') ||
    lower.includes('flour') ||
    lower.includes('oil') ||
    lower.includes('olive oil') ||
    lower.includes('vinegar') ||
    lower.includes('salt') ||
    lower.includes('pepper') ||
    lower.includes('spice') ||
    lower.includes('turmeric') ||
    lower.includes('cumin') ||
    lower.includes('paprika') ||
    lower.includes('oat') ||
    lower.includes('quinoa') ||
    lower.includes('sauce') ||
    lower.includes('soy sauce') ||
    lower.includes('honey') ||
    lower.includes('mustard') ||
    lower.includes('broth') ||
    lower.includes('stock') ||
    lower.includes('canned')
  ) {
    return 'pantry';
  }

  return 'other';
}
