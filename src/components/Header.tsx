import React, { useState } from 'react';
import {
  ChefHat,
  Sparkles,
  Utensils,
  CalendarDays,
  ShoppingBag,
  Bookmark,
  UserCheck,
  Refrigerator,
  ShieldCheck,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { User, UserProfile, FoodPreference } from '../types';

export type ActiveTab =
  | 'what-to-eat'
  | 'cook-with-ingredients'
  | 'categories'
  | 'planner'
  | 'grocery'
  | 'saved-meals'
  | 'profile'
  | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User | null;
  profile: UserProfile | null;
  preferences: FoodPreference[];
  onOpenAuthModal: (mode?: 'login' | 'signup' | 'admin') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  profile,
  preferences,
  onOpenAuthModal,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const allergyCount = preferences.filter((p) => p.preference_type === 'allergy').length;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand & Tagline */}
          <div
            id="brand-logo-container"
            onClick={() => setActiveTab('what-to-eat')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform duration-200">
              <ChefHat className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  AI Meal Assistant
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-tight">
                Healthy eating, made personal.
              </p>
            </div>
          </div>

          {/* User Profile & Auth Section */}
          <div className="flex items-center gap-3">
            {/* Quick Profile Summary Badge (for logged-in user) */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                id="header-profile-badge-btn"
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>
                  Diet: <strong className="capitalize text-slate-900">{profile?.dietary_preference || 'None'}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  Time: <strong className="text-slate-900">{profile?.typical_cooking_time || 25}m</strong>
                </span>
                {allergyCount > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-700 font-semibold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                      {allergyCount} {allergyCount === 1 ? 'Allergy' : 'Allergies'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* User Account Controls / Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-menu-btn"
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {currentUser.role === 'admin' ? '🛡️ Administrator' : 'Active Member'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-900 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-slate-500" />
                      <span>Profile & Diet Setup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAuthModal('login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-slate-500" />
                      <span>Switch Demo Account</span>
                    </button>

                    <div className="pt-1 mt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="header-login-btn"
                  onClick={() => onOpenAuthModal('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  id="header-signup-btn"
                  onClick={() => onOpenAuthModal('signup')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>

                <button
                  type="button"
                  id="header-admin-login-btn"
                  onClick={() => onOpenAuthModal('admin')}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-colors"
                  title="Administrator Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav
          id="main-navigation-tabs"
          className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-2 sm:pb-3 no-scrollbar scroll-smooth"
        >
          <button
            id="tab-what-to-eat"
            onClick={() => setActiveTab('what-to-eat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === 'what-to-eat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            What Should I Eat?
          </button>

          <button
            id="tab-cook-with-ingredients"
            onClick={() => setActiveTab('cook-with-ingredients')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === 'cook-with-ingredients'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Refrigerator className="w-4 h-4 shrink-0" />
            Cook With What I Have
          </button>

          <button
            id="tab-categories"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4 shrink-0" />
            Categories
          </button>

          <button
            id="tab-planner"
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === 'planner'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4 shrink-0" />
            Weekly Planner
          </button>

          <button
            id="tab-grocery"
            onClick={() => setActiveTab('grocery')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === 'grocery'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            Grocery List
          </button>

          <button
            id="tab-saved-meals"
            onClick={() => setActiveTab('saved-meals')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === 'saved-meals'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4 shrink-0" />
            My Meals
          </button>

          <button
            id="tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            Profile & Allergies
          </button>

          {/* Admin Tab (Visible if admin or available to switch) */}
          {isAdmin && (
            <button
              id="tab-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ml-auto ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-amber-400 shadow-md ring-2 ring-amber-400/40'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              Admin Portal
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
