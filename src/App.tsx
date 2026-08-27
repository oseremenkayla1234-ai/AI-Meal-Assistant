import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from './api/client';
import {
  User,
  UserProfile,
  FoodPreference,
  Meal,
  MealPlanEntry,
  GroceryItem,
  MealCategory,
  MealSlot,
  AuthSession,
  SystemAnnouncement,
} from './types';
import { Header, ActiveTab } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { PersonalizationWizard } from './components/PersonalizationWizard';
import { CookWithIngredients } from './components/CookWithIngredients';
import { CategoryBrowse } from './components/CategoryBrowse';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { GroceryList } from './components/GroceryList';
import { SavedMeals } from './components/SavedMeals';
import { ProfilePreferences } from './components/ProfilePreferences';
import { MealDetailModal } from './components/MealDetailModal';
import { AddToPlanModal } from './components/AddToPlanModal';
import { AuthModal } from './components/AuthModal';
import { AdminPortal } from './components/AdminPortal';
import { CheckCircle2, AlertCircle, Sparkles, Bell } from 'lucide-react';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('what-to-eat');
  const [currentUser, setCurrentUser] = useState<User | null>(api.getStoredUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<FoodPreference[]>([]);
  const [savedMeals, setSavedMeals] = useState<Meal[]>([]);
  const [planEntries, setPlanEntries] = useState<MealPlanEntry[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);

  // Modals
  const [activeDetailMeal, setActiveDetailMeal] = useState<Meal | null>(null);
  const [activePlanMeal, setActivePlanMeal] = useState<Meal | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'admin'>('login');

  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // safe fallback
    }
  };

  // Load user data whenever currentUser changes
  const loadUserData = async () => {
    try {
      // If we have a stored session or need to fetch current session
      const session = await api.getCurrentSession().catch(() => null);
      if (session) {
        setCurrentUser(session.user);
        setProfile(session.profile);
        setPreferences(session.preferences);
      }

      const [savedData, planData, grocData, annData] = await Promise.all([
        api.getSavedMeals(),
        api.getMealPlan(),
        api.getGroceryList(),
        api.getAnnouncements(),
      ]);

      setSavedMeals(savedData);
      setPlanEntries(planData);
      setGroceryItems(grocData);
      setAnnouncements(annData);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleAuthSuccess = (session: AuthSession) => {
    setCurrentUser(session.user);
    setProfile(session.profile);
    setPreferences(session.preferences);
    loadUserData();
    triggerConfetti();

    if (session.user.role === 'admin') {
      setActiveTab('admin');
      showToast(`Welcome Administrator ${session.user.name}!`, 'success');
    } else {
      showToast(`Welcome back, ${session.user.name}!`, 'success');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveTab('what-to-eat');
    showToast('Signed out successfully', 'info');
    loadUserData();
  };

  const handleOpenAuthModal = (mode: 'login' | 'signup' | 'admin' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Save / Unsave Meal handler
  const handleSaveToggle = async (meal: Meal) => {
    const isAlreadySaved = savedMeals.some((m) => m.id === meal.id || m.meal_name === meal.meal_name);
    if (isAlreadySaved) {
      const match = savedMeals.find((m) => m.id === meal.id || m.meal_name === meal.meal_name);
      if (match) {
        await api.deleteSavedMeal(match.id);
        setSavedMeals((prev) => prev.filter((m) => m.id !== match.id));
        showToast(`Removed "${meal.meal_name}" from My Meals`, 'info');
      }
    } else {
      const saved = await api.saveMeal(meal);
      setSavedMeals((prev) => [saved, ...prev]);
      triggerConfetti();
      showToast(`Saved "${meal.meal_name}" to My Meals!`, 'success');
    }
  };

  // Add Ingredients to Grocery List
  const handleAddToGrocery = async (meal: Meal) => {
    try {
      const added = await api.addMealIngredientsToGrocery(meal.ingredients);
      const updatedList = await api.getGroceryList();
      setGroceryItems(updatedList);
      showToast(`Added ${meal.ingredients.length} ingredients to Grocery List!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to add to grocery list', 'error');
    }
  };

  // Confirm Add to Plan
  const handleConfirmPlan = async (dayDate: string, slot: MealSlot, meal: Meal) => {
    try {
      const newEntry = await api.setMealPlanEntry({
        day_date: dayDate,
        meal_slot: slot,
        meal_id: meal.id,
        meal,
      });
      setPlanEntries((prev) => [
        ...prev.filter((e) => !(e.day_date === dayDate && e.meal_slot === slot)),
        newEntry,
      ]);
      triggerConfetti();
      showToast(`Planned "${meal.meal_name}" for ${dayDate} (${slot})!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update plan', 'error');
    }
  };

  // Quick Generate AI for a slot directly in weekly planner
  const handleQuickGenerateForSlot = async (dayDate: string, slot: MealSlot) => {
    try {
      const meal = await api.generateMeal({ meal_type: slot as any });
      await handleConfirmPlan(dayDate, slot, meal);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate meal for slot', 'error');
    }
  };

  // Remove plan entry
  const handleRemovePlanEntry = async (id: string) => {
    try {
      await api.removeMealPlanEntry(id);
      setPlanEntries((prev) => prev.filter((e) => e.id !== id));
      showToast('Removed meal from planner', 'info');
    } catch (err: any) {
      showToast('Failed to remove meal from plan', 'error');
    }
  };

  // Generate Grocery List from Planner
  const handleGenerateGroceryFromPlan = async () => {
    try {
      const res = await api.generateGroceryListFromPlan();
      const updatedList = await api.getGroceryList();
      setGroceryItems(updatedList);
      triggerConfetti();
      showToast(`Generated grocery list with ${res.added_count} ingredients from your meal plan!`, 'success');
      setActiveTab('grocery');
    } catch (err: any) {
      showToast(err.message || 'Failed to generate grocery list from planner', 'error');
    }
  };

  // Profile update
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await api.updateProfile(updates);
    setProfile(updated);
    showToast('Profile and preferences updated!', 'success');
  };

  // Preference add / delete
  const handleAddPreference = async (food_name: string, preference_type: 'dislike' | 'allergy') => {
    const newPref = await api.addPreference(food_name, preference_type);
    setPreferences((prev) => [...prev, newPref]);
    showToast(`Added ${food_name} to ${preference_type === 'allergy' ? 'allergies' : 'dislikes'}`, 'success');
  };

  const handleDeletePreference = async (id: string) => {
    await api.deletePreference(id);
    setPreferences((prev) => prev.filter((p) => p.id !== id));
    showToast('Removed preference', 'info');
  };

  // Grocery toggling and item management
  const handleToggleGroceryItem = async (id: string) => {
    const updated = await api.toggleGroceryItem(id);
    if (updated) {
      setGroceryItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
  };

  const handleAddGroceryItem = async (item_name: string, category: GroceryItem['category']) => {
    const item = await api.addGroceryItem({ item_name, category });
    setGroceryItems((prev) => [...prev, item]);
    showToast(`Added "${item_name}" to grocery list`, 'success');
  };

  const handleDeleteGroceryItem = async (id: string) => {
    await api.deleteGroceryItem(id);
    setGroceryItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCheckedGrocery = async () => {
    const res = await api.clearCheckedGroceryItems();
    setGroceryItems((prev) => prev.filter((item) => !item.checked));
    showToast(`Cleared ${res.cleared} checked items`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-950">
      {/* Top Persistent Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Broadcast Announcement Bar if active */}
      {announcements.length > 0 && announcements[0] && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                {announcements[0].type}
              </span>
              <span className="font-bold">{announcements[0].title}:</span>
              <span className="text-slate-300 hidden sm:inline">{announcements[0].message}</span>
            </div>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-emerald-400 font-semibold hover:underline shrink-0 text-[11px]"
            >
              Explore Recipes →
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        profile={profile}
        preferences={preferences}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeTab === 'what-to-eat' && (
          <PersonalizationWizard
            profile={profile}
            preferences={preferences}
            onGenerateMeal={(params) => api.generateMeal(params)}
            onOpenMealDetail={(meal) => setActiveDetailMeal(meal)}
            savedMeals={savedMeals}
            onSaveToggle={handleSaveToggle}
            onAddToPlan={(meal) => setActivePlanMeal(meal)}
            onAddToGrocery={handleAddToGrocery}
          />
        )}

        {activeTab === 'cook-with-ingredients' && (
          <CookWithIngredients
            profile={profile}
            preferences={preferences}
            onCookWithIngredients={(ings, notes) => api.cookWithIngredients(ings, notes)}
            onOpenMealDetail={(meal) => setActiveDetailMeal(meal)}
            savedMeals={savedMeals}
            onSaveToggle={handleSaveToggle}
            onAddToPlan={(meal) => setActivePlanMeal(meal)}
            onAddToGrocery={handleAddToGrocery}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryBrowse
            onGenerateCategoryMeal={(category) => api.generateMeal({ meal_type: category })}
            onOpenMealDetail={(meal) => setActiveDetailMeal(meal)}
            savedMeals={savedMeals}
            onSaveToggle={handleSaveToggle}
            onAddToPlan={(meal) => setActivePlanMeal(meal)}
            onAddToGrocery={handleAddToGrocery}
          />
        )}

        {activeTab === 'planner' && (
          <WeeklyPlanner
            planEntries={planEntries}
            savedMeals={savedMeals}
            onSetPlanEntry={(dayDate, slot, meal) => handleConfirmPlan(dayDate, slot, meal)}
            onRemovePlanEntry={handleRemovePlanEntry}
            onGenerateGroceryFromPlan={handleGenerateGroceryFromPlan}
            onOpenMealDetail={(meal) => setActiveDetailMeal(meal)}
            onQuickGenerateForSlot={handleQuickGenerateForSlot}
          />
        )}

        {activeTab === 'grocery' && (
          <GroceryList
            items={groceryItems}
            onToggleItem={handleToggleGroceryItem}
            onAddItem={handleAddGroceryItem}
            onDeleteItem={handleDeleteGroceryItem}
            onClearChecked={handleClearCheckedGrocery}
            onGenerateFromPlanner={handleGenerateGroceryFromPlan}
          />
        )}

        {activeTab === 'saved-meals' && (
          <SavedMeals
            savedMeals={savedMeals}
            onOpenMealDetail={(meal) => setActiveDetailMeal(meal)}
            onSaveToggle={handleSaveToggle}
            onAddToPlan={(meal) => setActivePlanMeal(meal)}
            onAddToGrocery={handleAddToGrocery}
            onNavigateToGenerate={() => setActiveTab('what-to-eat')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePreferences
            profile={profile}
            preferences={preferences}
            onUpdateProfile={handleUpdateProfile}
            onAddPreference={handleAddPreference}
            onDeletePreference={handleDeletePreference}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            onOpenMealDetail={(meal) => setActiveDetailMeal(meal)}
            onSwitchToUserView={() => setActiveTab('what-to-eat')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AI Meal Assistant</span>
            <span>•</span>
            <span>Healthy eating, made personal.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAuthModal('admin')}
              className="text-slate-400 hover:text-slate-800 text-[11px] font-semibold transition-colors"
            >
              Admin Portal
            </button>
            <span>•</span>
            <div className="text-center sm:text-right text-[11px] text-slate-500">
              AI Meal Assistant offers general wellness suggestions, not medical advice.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal (User Login, Sign Up, Admin Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={activeDetailMeal}
        isOpen={!!activeDetailMeal}
        onClose={() => setActiveDetailMeal(null)}
        isSaved={
          activeDetailMeal
            ? savedMeals.some((m) => m.id === activeDetailMeal.id || m.meal_name === activeDetailMeal.meal_name)
            : false
        }
        onSaveToggle={handleSaveToggle}
        onAddToPlan={(meal) => setActivePlanMeal(meal)}
        onAddToGrocery={handleAddToGrocery}
      />

      {/* Add To Plan Modal */}
      <AddToPlanModal
        meal={activePlanMeal}
        isOpen={!!activePlanMeal}
        onClose={() => setActivePlanMeal(null)}
        onConfirmPlan={handleConfirmPlan}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
