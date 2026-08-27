import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  ChefHat,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { User, DietaryPreference, AuthSession } from '../types';
import { api } from '../api/client';
import { REALISTIC_AVATARS } from '../utils/foodImages';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (session: AuthSession) => void;
  initialMode?: 'login' | 'signup' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'admin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dietaryPref, setDietaryPref] = useState<DietaryPreference>('none');
  const [cookingTime, setCookingTime] = useState<number>(25);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'admin') {
        const session = await api.adminLogin(email, password);
        onAuthSuccess(session);
        onClose();
      } else if (mode === 'login') {
        const session = await api.login(email, password, 'user');
        onAuthSuccess(session);
        onClose();
      } else {
        const session = await api.signup({
          name,
          email,
          password,
          dietary_preference: dietaryPref,
          typical_cooking_time: cookingTime,
        });
        onAuthSuccess(session);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoType: 'kayla' | 'alex' | 'sarah' | 'marcus' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (demoType === 'admin') {
        const session = await api.adminLogin('admin@mealassist.ai', 'kayla@1234');
        onAuthSuccess(session);
        onClose();
      } else if (demoType === 'kayla') {
        const session = await api.login('oseremenkayla1234@gmail.com', 'kayla@1234', 'user');
        onAuthSuccess(session);
        onClose();
      } else if (demoType === 'alex') {
        const session = await api.login('alex@example.com', 'kayla@1234', 'user');
        onAuthSuccess(session);
        onClose();
      } else if (demoType === 'sarah') {
        const session = await api.login('sarah@example.com', 'kayla@1234', 'user');
        onAuthSuccess(session);
        onClose();
      } else if (demoType === 'marcus') {
        const session = await api.login('marcus@example.com', 'kayla@1234', 'user');
        onAuthSuccess(session);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to switch demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              mode === 'admin'
                ? 'bg-slate-900 shadow-slate-900/20'
                : 'bg-emerald-600 shadow-emerald-600/20'
            }`}
          >
            {mode === 'admin' ? (
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            ) : (
              <ChefHat className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-xl font-bold text-slate-900 tracking-tight">
              {mode === 'admin'
                ? 'Admin Portal Access'
                : mode === 'signup'
                ? 'Create Your Account'
                : 'Welcome Back'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {mode === 'admin'
                ? 'Executive recipe & system management'
                : 'Personalized AI meals and smart grocery lists'}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-6">
          <button
            type="button"
            id="auth-tab-login"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            id="auth-tab-signup"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            id="auth-tab-admin"
            onClick={() => {
              setMode('admin');
              setErrorMessage(null);
            }}
            className={`flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'admin'
                ? 'bg-slate-900 text-amber-400 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  mode === 'admin' ? 'admin@mealassist.ai' : 'you@example.com'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Additional Signup Fields */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Dietary Style
                </label>
                <select
                  value={dietaryPref}
                  onChange={(e) => setDietaryPref(e.target.value as DietaryPreference)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="none">No Restrictions</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="keto">Keto</option>
                  <option value="gluten-free">Gluten-Free</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Cooking Time
                </label>
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={cookingTime}
                    onChange={(e) => setCookingTime(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-none text-xs"
                  >
                    <option value={15}>15 mins</option>
                    <option value={20}>20 mins</option>
                    <option value={25}>25 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mode === 'admin'
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <>
                <span>
                  {mode === 'admin'
                    ? 'Log In as Administrator'
                    : mode === 'signup'
                    ? 'Create Free Account'
                    : 'Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              ⚡ 1-Click Demo Profiles
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
              Instant test
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              id="demo-user-kayla"
              onClick={() => handleQuickDemoLogin('kayla')}
              className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all group"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="Kayla"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                  Kayla
                </div>
                <div className="text-[10px] text-slate-500 truncate">oseremenkayla...</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-user-alex"
              onClick={() => handleQuickDemoLogin('alex')}
              className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all group"
            >
              <img
                src={REALISTIC_AVATARS.alex}
                alt="Alex Rivera"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                  Alex Rivera
                </div>
                <div className="text-[10px] text-slate-500 truncate">Default User</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-user-sarah"
              onClick={() => handleQuickDemoLogin('sarah')}
              className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all group"
            >
              <img
                src={REALISTIC_AVATARS.sarah}
                alt="Sarah Chen"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                  Sarah Chen
                </div>
                <div className="text-[10px] text-emerald-600 truncate">Vegetarian</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-user-marcus"
              onClick={() => handleQuickDemoLogin('marcus')}
              className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all group"
            >
              <img
                src={REALISTIC_AVATARS.marcus}
                alt="Marcus Vance"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                  Marcus Vance
                </div>
                <div className="text-[10px] text-amber-600 truncate">Keto / High Pro</div>
              </div>
            </button>

            <button
              type="button"
              id="demo-user-admin"
              onClick={() => handleQuickDemoLogin('admin')}
              className="flex items-center gap-2 p-2 rounded-xl border border-slate-300 hover:border-slate-800 bg-slate-900 text-white text-left transition-all group shadow-xs col-span-2 sm:col-span-2"
            >
              <img
                src={REALISTIC_AVATARS.admin}
                alt="Admin"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-slate-700"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-300 truncate">Chef Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@mealassist.ai</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
