import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Utensils,
  Calendar,
  ShoppingBag,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
  Search,
  CheckCircle2,
  Layers,
  BarChart3,
  Bell,
  ChefHat,
  ExternalLink,
} from 'lucide-react';
import { AdminStats, User, Meal, SystemAnnouncement, UserProfile } from '../types';
import { api } from '../api/client';
import { getRealisticFoodImage, REALISTIC_FOOD_IMAGES } from '../utils/foodImages';

interface AdminPortalProps {
  onOpenMealDetail: (meal: Meal) => void;
  onSwitchToUserView?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onOpenMealDetail,
  onSwitchToUserView,
}) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'meals' | 'announcements'>('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Announcement Form state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnMessage, setNewAnnMessage] = useState('');
  const [newAnnType, setNewAnnType] = useState<'tip' | 'alert' | 'update'>('tip');

  // New Curated Recipe Form modal / toggle
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [newMealName, setNewMealName] = useState('');
  const [newMealCategory, setNewMealCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('dinner');
  const [newMealTime, setNewMealTime] = useState(20);
  const [newMealDifficulty, setNewMealDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newMealEmoji, setNewMealEmoji] = useState('🥗');
  const [newMealImageUrl, setNewMealImageUrl] = useState(REALISTIC_FOOD_IMAGES.mediterranean_salad);
  const [newMealTags, setNewMealTags] = useState('High Protein, Quick & Easy, Anti-Inflammatory');
  const [newMealIngredients, setNewMealIngredients] = useState('Baby spinach, Cherry tomatoes, Cucumber, Kalamata olives, Feta cheese, Extra virgin olive oil, Lemon juice');
  const [newMealInstructions, setNewMealInstructions] = useState('1. Wash and chop vegetables.\n2. Toss spinach, tomatoes, and cucumbers in a bowl.\n3. Drizzle olive oil and fresh lemon juice.\n4. Top with crumbled feta and serve.');
  const [newMealWhy, setNewMealWhy] = useState('A revitalizing, antioxidant-dense bowl with clean Mediterranean healthy fats.');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData, mealsData, annData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminMeals(),
        api.getAnnouncements(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setMeals(mealsData);
      setAnnouncements(annData);
    } catch (err) {
      console.error('Failed to load admin portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await api.adminDeleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleDeleteMeal = async (mealId: string, mealName: string) => {
    if (!window.confirm(`Are you sure you want to delete meal "${mealName}"?`)) return;
    try {
      await api.adminDeleteMeal(mealId);
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete meal');
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnMessage) return;
    try {
      const created = await api.addAnnouncement({
        title: newAnnTitle,
        message: newAnnMessage,
        type: newAnnType,
      });
      setAnnouncements((prev) => [created, ...prev]);
      setNewAnnTitle('');
      setNewAnnMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const handleCreateCuratedMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;

    const ingArray = newMealIngredients
      .split('\n')
      .flatMap((line) => line.split(','))
      .map((s) => s.trim())
      .filter(Boolean);

    const stepArray = newMealInstructions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const tagArray = newMealTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const mealPayload: Meal = {
      id: 'meal_curated_' + Date.now(),
      meal_name: newMealName.trim(),
      emoji: newMealEmoji || '🍽️',
      image_url: newMealImageUrl || getRealisticFoodImage(newMealName),
      category: newMealCategory,
      time_minutes: Number(newMealTime) || 20,
      difficulty: newMealDifficulty,
      nutrition_tags: tagArray.length > 0 ? tagArray : ['Nutritious', 'Balanced'],
      ingredients: ingArray,
      instructions: stepArray,
      why_this_meal: newMealWhy || 'Crafted by executive culinary team.',
      substitutions: [],
      created_at: new Date().toISOString(),
    };

    try {
      const saved = await api.saveMeal(mealPayload);
      setMeals((prev) => [saved, ...prev]);
      setShowAddMealModal(false);
      setNewMealName('');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to add curated recipe');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.profile?.dietary_preference && u.profile.dietary_preference.toLowerCase().includes(q))
    );
  });

  const filteredMeals = meals.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.meal_name.toLowerCase().includes(q) ||
      (m.category && m.category.toLowerCase().includes(q)) ||
      m.ingredients.some((i) => i.toLowerCase().includes(q))
    );
  });

  return (
    <div id="admin-portal-view" className="space-y-8 animate-in fade-in duration-200">
      {/* Top Admin Executive Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Administrator Management Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Director Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Oversee users, system curated recipes with realistic photography, nutrition safety, and platform health.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchToUserView && (
              <button
                type="button"
                onClick={onSwitchToUserView}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                View User App
              </button>
            )}
            <button
              type="button"
              onClick={loadAdminData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Refresh Analytics
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            System Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'users'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            User Directory ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('meals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'meals'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Recipe Catalog ({meals.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('announcements')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'announcements'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            Broadcast Notices ({announcements.length})
          </button>
        </div>
      </div>

      {/* SUB-TAB: SYSTEM ANALYTICS OVERVIEW */}
      {activeSubTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Registered Users</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalUsers}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">
                Active member profiles
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Saved Meals</span>
                <Utensils className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalMeals}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                With realistic photography
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">Planned Meals</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {stats.totalPlanEntries}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Across weekly schedules
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold">System Health</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {stats.systemHealth}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                Gemini 2.5 AI & Cache active
              </div>
            </div>
          </div>

          {/* Allergy & Dietary Breakdown Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Hard Allergies */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Strict Allergen Exclusions
                  </h3>
                </div>
                <span className="text-xs font-semibold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                  100% Zero-Tolerance Rule
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                These allergens are strictly excluded by the AI algorithm across all recipe generations.
              </p>

              {stats.topAllergies.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No user allergies logged yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {stats.topAllergies.map((al, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        <span className="text-xs font-bold text-slate-800">{al.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                        {al.count} {al.count === 1 ? 'user' : 'users'} affected
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dietary Preference Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Dietary Distribution
                  </h3>
                </div>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                  Active Styles
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                User lifestyle preferences guiding ingredient and macro proportions.
              </p>

              <div className="space-y-2.5">
                {stats.topDietaryPreferences.map((dp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold capitalize text-slate-800">
                        {dp.name === 'none' ? 'Standard / No Restriction' : dp.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {dp.count} {dp.count === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: USER DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered User Accounts</h3>
              <p className="text-xs text-slate-500">
                Inspect member profiles, dietary restrictions, and activity.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, diet..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Diet & Time</th>
                  <th className="py-3 px-4">Allergies</th>
                  <th className="py-3 px-4">Saved Meals</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-slate-900 text-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {u.role === 'admin' ? '🛡️ Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium capitalize text-slate-800">
                        {u.profile?.dietary_preference || 'None'}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {u.profile?.typical_cooking_time || 25} mins prep
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.allergies && u.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.allergies.map((al: string, i: number) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              {al}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{u.savedMealsCount || 0}</span>
                      <span className="text-slate-400 ml-1">recipes</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: RECIPE CATALOG */}
      {activeSubTab === 'meals' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                System Curated Recipes & Photography
              </h3>
              <p className="text-xs text-slate-500">
                Manage realistic culinary images, nutrition tags, and step-by-step instructions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="admin-add-recipe-btn"
                onClick={() => setShowAddMealModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Curated Recipe
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeals.map((meal) => {
              const photoUrl = getRealisticFoodImage(meal);
              return (
                <div
                  key={meal.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-200">
                    <img
                      src={photoUrl}
                      alt={meal.meal_name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold">
                      {meal.emoji} {meal.category || 'Dinner'}
                    </div>
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/90 text-slate-800 text-[10px] font-bold">
                      {meal.time_minutes}m • {meal.difficulty}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        onClick={() => onOpenMealDetail(meal)}
                        className="font-bold text-slate-900 text-sm hover:text-emerald-700 cursor-pointer line-clamp-1 mb-1.5"
                      >
                        {meal.meal_name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {meal.why_this_meal}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {meal.nutrition_tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-700 border border-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => onOpenMealDetail(meal)}
                        className="text-emerald-700 font-semibold hover:underline"
                      >
                        Inspect Recipe
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMeal(meal.id, meal.meal_name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete meal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB: BROADCAST ANNOUNCEMENTS */}
      {activeSubTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post New Announcement */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Publish Broadcast Notice
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Push nutrition advisories, seasonal ingredient alerts, or tips to all users.
            </p>

            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  placeholder="e.g. Summer Hydration & Produce Guide"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Type
                </label>
                <select
                  value={newAnnType}
                  onChange={(e) => setNewAnnType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="tip">💡 Nutrition Tip</option>
                  <option value="alert">⚠️ Allergy / Safety Notice</option>
                  <option value="update">✨ Recipe System Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={newAnnMessage}
                  onChange={(e) => setNewAnnMessage(e.target.value)}
                  placeholder="Detailed guidelines or seasonal highlights..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Publish to Users
              </button>
            </form>
          </div>

          {/* Active Announcements List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Active Broadcasts ({announcements.length})
            </h3>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active announcements.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                      ann.type === 'alert'
                        ? 'bg-rose-50/70 border-rose-200'
                        : ann.type === 'tip'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            ann.type === 'alert'
                              ? 'bg-rose-200 text-rose-900'
                              : ann.type === 'tip'
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-slate-200 text-slate-800'
                          }`}
                        >
                          {ann.type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {ann.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                      <div className="text-[10px] text-slate-400 mt-2 font-medium">
                        Published on {ann.date}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                      title="Remove announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD CURATED RECIPE MODAL */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Add New Curated System Recipe
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Specify ingredients, step-by-step instructions, and realistic food photography.
            </p>

            <form onSubmit={handleCreateCuratedMeal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newMealName}
                    onChange={(e) => setNewMealName(e.target.value)}
                    placeholder="e.g. Lemon Herb Wild Salmon Bowl"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newMealCategory}
                    onChange={(e) => setNewMealCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Time (mins)
                  </label>
                  <input
                    type="number"
                    value={newMealTime}
                    onChange={(e) => setNewMealTime(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newMealDifficulty}
                    onChange={(e) => setNewMealDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={newMealEmoji}
                    onChange={(e) => setNewMealEmoji(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Realistic Image URL (or Unsplash photo)
                </label>
                <input
                  type="url"
                  value={newMealImageUrl}
                  onChange={(e) => setNewMealImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ingredients (comma or newline separated)
                </label>
                <textarea
                  rows={2}
                  value={newMealIngredients}
                  onChange={(e) => setNewMealIngredients(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructions (step by step)
                </label>
                <textarea
                  rows={3}
                  value={newMealInstructions}
                  onChange={(e) => setNewMealInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddMealModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs"
                >
                  Save to System Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
