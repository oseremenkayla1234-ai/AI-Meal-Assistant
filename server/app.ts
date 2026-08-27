import express from 'express';
import dotenv from 'dotenv';
import { db, categorizeIngredient, DEFAULT_USER_ID, ADMIN_USER_ID } from './db.js';
import { generateSingleMeal, generateCookWithIngredients } from './gemini.js';

dotenv.config();

export function createExpressApp(): express.Express {
  const app = express();
  app.use(express.json());

  // Helper to extract authenticated user ID
  const getUserId = (req: express.Request): string => {
    const headerId = req.headers['x-user-id'];
    if (typeof headerId === 'string' && headerId.trim()) {
      return headerId.trim();
    }
    return DEFAULT_USER_ID;
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: process.env.VERCEL ? 'vercel' : 'node' });
  });

  // ==========================================
  // AUTHENTICATION & USER SESSIONS
  // ==========================================

  // Demo user quick login accounts
  app.get('/api/auth/demo-users', (req, res) => {
    try {
      const users = db.getAllUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch demo accounts' });
    }
  });

  // Current session
  app.get('/api/auth/me', (req, res) => {
    try {
      const userId = getUserId(req);
      const user = db.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const profile = db.getProfile(userId);
      const preferences = db.getFoodPreferences(userId);
      res.json({ user, profile, preferences, token: `tok_${user.id}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get user session' });
    }
  });

  // User & Admin Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = db.authenticateUser(email, password, role);
      const profile = db.getProfile(user.id);
      const preferences = db.getFoodPreferences(user.id);

      res.json({
        user,
        profile,
        preferences,
        token: `tok_${user.id}`,
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid credentials' });
    }
  });

  // User Sign Up
  app.post('/api/auth/signup', (req, res) => {
    try {
      const { email, name, password, dietary_preference, typical_cooking_time } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const user = db.createUser({ email, name, password, role: 'user' });

      if (dietary_preference || typical_cooking_time) {
        db.updateProfile(user.id, {
          dietary_preference: dietary_preference || 'none',
          typical_cooking_time: typical_cooking_time || 25,
        });
      }

      const profile = db.getProfile(user.id);
      const preferences = db.getFoodPreferences(user.id);

      res.json({
        user,
        profile,
        preferences,
        token: `tok_${user.id}`,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Sign up failed' });
    }
  });

  // Admin Dedicated Login
  app.post('/api/auth/admin-login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Admin email and password are required.' });
      }

      const user = db.authenticateUser(email, password, 'admin');
      const profile = db.getProfile(user.id);
      const preferences = db.getFoodPreferences(user.id);

      res.json({
        user,
        profile,
        preferences,
        token: `tok_${user.id}`,
      });
    } catch (err: any) {
      res.status(403).json({ error: err.message || 'Admin authentication failed' });
    }
  });

  // ==========================================
  // ADMIN DASHBOARD & SYSTEM APIS
  // ==========================================

  app.get('/api/admin/stats', (req, res) => {
    try {
      const stats = db.getAdminStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/admin/users', (req, res) => {
    try {
      const allUsers = db.getAllUsers();
      const usersWithDetails = allUsers.map((u) => {
        const prof = db.getProfile(u.id);
        const prefs = db.getFoodPreferences(u.id);
        const saved = db.getSavedMeals(u.id);
        const plan = db.getMealPlan(u.id);
        return {
          ...u,
          profile: prof,
          allergiesCount: prefs.filter((p) => p.preference_type === 'allergy').length,
          allergies: prefs.filter((p) => p.preference_type === 'allergy').map((p) => p.food_name),
          dislikes: prefs.filter((p) => p.preference_type === 'dislike').map((p) => p.food_name),
          savedMealsCount: saved.length,
          planCount: plan.length,
        };
      });
      res.json(usersWithDetails);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch users list' });
    }
  });

  app.delete('/api/admin/users/:id', (req, res) => {
    try {
      const success = db.deleteUser(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to delete user' });
    }
  });

  app.get('/api/admin/meals', (req, res) => {
    try {
      const meals = db.getAllSystemMeals();
      res.json(meals);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch system meals' });
    }
  });

  app.delete('/api/admin/meals/:id', (req, res) => {
    try {
      const success = db.adminDeleteMeal(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete meal' });
    }
  });

  app.get('/api/admin/announcements', (req, res) => {
    try {
      const anns = db.getAnnouncements();
      res.json(anns);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch announcements' });
    }
  });

  app.post('/api/admin/announcements', (req, res) => {
    try {
      const { title, message, type } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required.' });
      }
      const ann = db.addAnnouncement({ title, message, type: type || 'tip' });
      res.json(ann);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add announcement' });
    }
  });

  app.delete('/api/admin/announcements/:id', (req, res) => {
    try {
      const success = db.deleteAnnouncement(req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete announcement' });
    }
  });

  // ==========================================
  // USER PROFILE & PREFERENCES
  // ==========================================

  app.get('/api/profile', (req, res) => {
    try {
      const userId = getUserId(req);
      const profile = db.getProfile(userId);
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch profile' });
    }
  });

  app.put('/api/profile', (req, res) => {
    try {
      const userId = getUserId(req);
      const updated = db.updateProfile(userId, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update profile' });
    }
  });

  app.get('/api/preferences', (req, res) => {
    try {
      const userId = getUserId(req);
      const prefs = db.getFoodPreferences(userId);
      res.json(prefs);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch preferences' });
    }
  });

  app.post('/api/preferences', (req, res) => {
    try {
      const userId = getUserId(req);
      const { food_name, preference_type } = req.body;
      if (!food_name || !['dislike', 'allergy'].includes(preference_type)) {
        return res.status(400).json({ error: 'Valid food_name and preference_type ("dislike" or "allergy") are required.' });
      }
      const newPref = db.addFoodPreference(userId, food_name, preference_type);
      res.json(newPref);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add preference' });
    }
  });

  app.delete('/api/preferences/:id', (req, res) => {
    try {
      const userId = getUserId(req);
      const success = db.deleteFoodPreference(userId, req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete preference' });
    }
  });

  // ==========================================
  // AI MEAL GENERATION
  // ==========================================

  app.post('/api/generate-meal', async (req, res) => {
    try {
      const userId = getUserId(req);
      const profile = db.getProfile(userId);
      const preferences = db.getFoodPreferences(userId);
      const { meal_type, available_ingredients, override_time, cravings_or_notes, custom_goal } = req.body;

      const meal = await generateSingleMeal(profile, preferences, {
        meal_type,
        available_ingredients,
        override_time,
        cravings_or_notes,
        custom_goal,
      });

      res.json(meal);
    } catch (err: any) {
      console.error('Error generating meal:', err);
      res.status(500).json({ error: err.message || "Couldn't generate a meal right now — try again." });
    }
  });

  app.post('/api/cook-with-ingredients', async (req, res) => {
    try {
      const userId = getUserId(req);
      const { ingredients, notes } = req.body;
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'Please provide at least one ingredient.' });
      }
      const profile = db.getProfile(userId);
      const preferences = db.getFoodPreferences(userId);

      const meals = await generateCookWithIngredients(profile, preferences, ingredients, notes);
      res.json(meals);
    } catch (err: any) {
      console.error('Error in cook-with-ingredients:', err);
      res.status(500).json({ error: err.message || "Couldn't generate meal ideas right now — try again." });
    }
  });

  // ==========================================
  // SAVED MEALS
  // ==========================================

  app.get('/api/saved-meals', (req, res) => {
    try {
      const userId = getUserId(req);
      const meals = db.getSavedMeals(userId);
      res.json(meals);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch saved meals' });
    }
  });

  app.post('/api/saved-meals', (req, res) => {
    try {
      const userId = getUserId(req);
      const meal = req.body;
      if (!meal || !meal.meal_name) {
        return res.status(400).json({ error: 'Valid meal object required.' });
      }
      const saved = db.saveMeal(userId, meal);
      res.json(saved);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save meal' });
    }
  });

  app.delete('/api/saved-meals/:id', (req, res) => {
    try {
      const userId = getUserId(req);
      const success = db.deleteSavedMeal(userId, req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete saved meal' });
    }
  });

  // ==========================================
  // WEEKLY MEAL PLAN
  // ==========================================

  app.get('/api/meal-plan', (req, res) => {
    try {
      const userId = getUserId(req);
      const plan = db.getMealPlan(userId);
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch meal plan' });
    }
  });

  app.post('/api/meal-plan', (req, res) => {
    try {
      const userId = getUserId(req);
      const { day_date, meal_slot, meal_id, meal } = req.body;
      if (!day_date || !meal_slot) {
        return res.status(400).json({ error: 'day_date and meal_slot are required.' });
      }
      const entry = db.setMealPlanEntry(userId, { day_date, meal_slot, meal_id, meal });
      res.json(entry);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update meal plan' });
    }
  });

  app.delete('/api/meal-plan/:id', (req, res) => {
    try {
      const userId = getUserId(req);
      const success = db.removeMealPlanEntry(userId, req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to remove plan entry' });
    }
  });

  // ==========================================
  // GROCERY LIST
  // ==========================================

  app.get('/api/grocery-list', (req, res) => {
    try {
      const userId = getUserId(req);
      const items = db.getGroceryList(userId);
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch grocery list' });
    }
  });

  app.post('/api/grocery-list', (req, res) => {
    try {
      const userId = getUserId(req);
      const { item_name, category, source } = req.body;
      if (!item_name) {
        return res.status(400).json({ error: 'Item name is required.' });
      }
      const item = db.addGroceryItem(userId, { item_name, category, source });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add grocery item' });
    }
  });

  app.put('/api/grocery-list/:id/toggle', (req, res) => {
    try {
      const userId = getUserId(req);
      const item = db.toggleGroceryItem(userId, req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to toggle item' });
    }
  });

  app.delete('/api/grocery-list/:id', (req, res) => {
    try {
      const userId = getUserId(req);
      const success = db.deleteGroceryItem(userId, req.params.id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete grocery item' });
    }
  });

  app.post('/api/grocery-list/clear-checked', (req, res) => {
    try {
      const userId = getUserId(req);
      const cleared = db.clearCheckedGroceryItems(userId);
      res.json({ cleared });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to clear items' });
    }
  });

  app.post('/api/grocery-list/add-from-meal', (req, res) => {
    try {
      const userId = getUserId(req);
      const { ingredients } = req.body;
      if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: 'No ingredients provided.' });
      }
      const itemsToAdd = ingredients.map((ing: string) => ({
        item_name: ing,
        category: categorizeIngredient(ing),
        source: 'saved' as const,
      }));
      const created = db.addMultipleGroceryItems(userId, itemsToAdd);
      res.json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add ingredients to grocery list' });
    }
  });

  app.post('/api/grocery-list/generate-from-plan', (req, res) => {
    try {
      const userId = getUserId(req);
      const planEntries = db.getMealPlan(userId);
      const savedMeals = db.getSavedMeals(userId);

      const allIngredients: string[] = [];

      for (const entry of planEntries) {
        if (entry.meal && Array.isArray(entry.meal.ingredients)) {
          allIngredients.push(...entry.meal.ingredients);
        } else if (entry.meal_id) {
          const match = savedMeals.find((m) => m.id === entry.meal_id);
          if (match && Array.isArray(match.ingredients)) {
            allIngredients.push(...match.ingredients);
          }
        }
      }

      if (allIngredients.length === 0) {
        return res.status(400).json({ error: 'No meals found in your planner. Add meals to your plan first!' });
      }

      const itemsToAdd = allIngredients.map((ing) => ({
        item_name: ing,
        category: categorizeIngredient(ing),
        source: 'planner' as const,
      }));

      const added = db.addMultipleGroceryItems(userId, itemsToAdd);
      res.json({ added_count: added.length, items: added });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to generate grocery list from planner' });
    }
  });

  return app;
}
