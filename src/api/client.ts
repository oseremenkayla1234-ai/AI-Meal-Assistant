import {
  User,
  UserProfile,
  FoodPreference,
  Meal,
  MealPlanEntry,
  GroceryItem,
  GenerateMealRequest,
  AdminStats,
  SystemAnnouncement,
  AuthSession,
} from '../types';

const AUTH_USER_KEY = 'ai_meal_assistant_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // ignore
  }
}

function getAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const user = getStoredUser();
  if (user && user.id) {
    headers['x-user-id'] = user.id;
  }
  return headers;
}

export const api = {
  getStoredUser,
  setStoredUser,

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  async getDemoUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/demo-users');
    if (!res.ok) throw new Error('Failed to load demo accounts');
    return res.json();
  },

  async getCurrentSession(): Promise<AuthSession> {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Session not found');
    const data = await res.json();
    setStoredUser(data.user);
    return data;
  },

  async login(email: string, password: string, role?: 'user' | 'admin'): Promise<AuthSession> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid credentials');
    }
    const data: AuthSession = await res.json();
    setStoredUser(data.user);
    return data;
  },

  async signup(payload: {
    email: string;
    name: string;
    password: string;
    dietary_preference?: string;
    typical_cooking_time?: number;
  }): Promise<AuthSession> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sign up');
    }
    const data: AuthSession = await res.json();
    setStoredUser(data.user);
    return data;
  },

  async adminLogin(email: string, password: string): Promise<AuthSession> {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Admin authentication failed');
    }
    const data: AuthSession = await res.json();
    setStoredUser(data.user);
    return data;
  },

  logout(): void {
    setStoredUser(null);
  },

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load admin stats');
    return res.json();
  },

  async getAdminUsers(): Promise<
    (User & {
      profile: UserProfile;
      allergiesCount: number;
      allergies: string[];
      dislikes: string[];
      savedMealsCount: number;
      planCount: number;
    })[]
  > {
    const res = await fetch('/api/admin/users', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load users list');
    return res.json();
  },

  async adminDeleteUser(userId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete user');
    }
    return res.json();
  },

  async getAdminMeals(): Promise<Meal[]> {
    const res = await fetch('/api/admin/meals', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load system meals');
    return res.json();
  },

  async adminDeleteMeal(mealId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/meals/${mealId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete meal');
    return res.json();
  },

  async getAnnouncements(): Promise<SystemAnnouncement[]> {
    const res = await fetch('/api/admin/announcements', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load announcements');
    return res.json();
  },

  async addAnnouncement(ann: { title: string; message: string; type?: 'tip' | 'alert' | 'update' }): Promise<SystemAnnouncement> {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ann),
    });
    if (!res.ok) throw new Error('Failed to add announcement');
    return res.json();
  },

  async deleteAnnouncement(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete announcement');
    return res.json();
  },

  // ==========================================
  // PROFILE & PREFERENCES
  // ==========================================

  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async getPreferences(): Promise<FoodPreference[]> {
    const res = await fetch('/api/preferences', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load preferences');
    return res.json();
  },

  async addPreference(food_name: string, preference_type: 'dislike' | 'allergy'): Promise<FoodPreference> {
    const res = await fetch('/api/preferences', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ food_name, preference_type }),
    });
    if (!res.ok) throw new Error('Failed to add food preference');
    return res.json();
  },

  async deletePreference(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/preferences/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete preference');
    return res.json();
  },

  // ==========================================
  // AI MEAL GENERATION
  // ==========================================

  async generateMeal(request: GenerateMealRequest): Promise<Meal> {
    const res = await fetch('/api/generate-meal', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Couldn't generate a meal right now — try again.");
    }
    return res.json();
  },

  async cookWithIngredients(ingredients: string[], notes?: string): Promise<Meal[]> {
    const res = await fetch('/api/cook-with-ingredients', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ingredients, notes }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Couldn't generate meal ideas right now — try again.");
    }
    return res.json();
  },

  // ==========================================
  // SAVED MEALS
  // ==========================================

  async getSavedMeals(): Promise<Meal[]> {
    const res = await fetch('/api/saved-meals', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load saved meals');
    return res.json();
  },

  async saveMeal(meal: Meal): Promise<Meal> {
    const res = await fetch('/api/saved-meals', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(meal),
    });
    if (!res.ok) throw new Error('Failed to save meal');
    return res.json();
  },

  async deleteSavedMeal(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/saved-meals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete saved meal');
    return res.json();
  },

  // ==========================================
  // MEAL PLAN
  // ==========================================

  async getMealPlan(): Promise<MealPlanEntry[]> {
    const res = await fetch('/api/meal-plan', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load meal plan');
    return res.json();
  },

  async setMealPlanEntry(entry: {
    day_date: string;
    meal_slot: MealPlanEntry['meal_slot'];
    meal_id?: string | null;
    meal?: Meal;
  }): Promise<MealPlanEntry> {
    const res = await fetch('/api/meal-plan', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to update meal plan');
    return res.json();
  },

  async removeMealPlanEntry(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/meal-plan/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove meal from plan');
    return res.json();
  },

  // ==========================================
  // GROCERY LIST
  // ==========================================

  async getGroceryList(): Promise<GroceryItem[]> {
    const res = await fetch('/api/grocery-list', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load grocery list');
    return res.json();
  },

  async addGroceryItem(item: { item_name: string; category?: GroceryItem['category'] }): Promise<GroceryItem> {
    const res = await fetch('/api/grocery-list', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add grocery item');
    return res.json();
  },

  async toggleGroceryItem(id: string): Promise<GroceryItem> {
    const res = await fetch(`/api/grocery-list/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle item');
    return res.json();
  },

  async deleteGroceryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/grocery-list/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete grocery item');
    return res.json();
  },

  async clearCheckedGroceryItems(): Promise<{ cleared: number }> {
    const res = await fetch('/api/grocery-list/clear-checked', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to clear items');
    return res.json();
  },

  async addMealIngredientsToGrocery(ingredients: string[]): Promise<GroceryItem[]> {
    const res = await fetch('/api/grocery-list/add-from-meal', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ingredients }),
    });
    if (!res.ok) throw new Error('Failed to add ingredients to grocery list');
    return res.json();
  },

  async generateGroceryListFromPlan(): Promise<{ added_count: number; items: GroceryItem[] }> {
    const res = await fetch('/api/grocery-list/generate-from-plan', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate grocery list from planner');
    }
    return res.json();
  },
};
