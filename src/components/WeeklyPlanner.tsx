import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Utensils,
} from 'lucide-react';
import { Meal, MealPlanEntry, MealSlot } from '../types';

interface WeeklyPlannerProps {
  planEntries: MealPlanEntry[];
  savedMeals: Meal[];
  onSetPlanEntry: (dayDate: string, slot: MealSlot, meal: Meal) => void;
  onRemovePlanEntry: (id: string) => void;
  onGenerateGroceryFromPlan: () => Promise<void>;
  onOpenMealDetail: (meal: Meal) => void;
  onQuickGenerateForSlot: (dayDate: string, slot: MealSlot) => Promise<void>;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  planEntries,
  savedMeals,
  onSetPlanEntry,
  onRemovePlanEntry,
  onGenerateGroceryFromPlan,
  onOpenMealDetail,
  onQuickGenerateForSlot,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [isGeneratingGrocery, setIsGeneratingGrocery] = useState<boolean>(false);
  const [slotPicker, setSlotPicker] = useState<{ dayDate: string; slot: MealSlot } | null>(null);
  const [isGeneratingSlotAI, setIsGeneratingSlotAI] = useState<string | null>(null);

  // Generate 7 days for the current week window
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);

  // Find Monday of the target week (or start from today)
  const currentDayOfWeek = baseDate.getDay();
  // distance from monday: 0 is Sunday -> -6, 1 is Mon -> 0, etc.
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() + distanceToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = new Date().toISOString().split('T')[0] === dateStr;
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayLabel, formattedDate, isToday };
  });

  const slots: { slot: MealSlot; label: string; icon: string }[] = [
    { slot: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { slot: 'lunch', label: 'Lunch', icon: '🥗' },
    { slot: 'dinner', label: 'Dinner', icon: '🍲' },
    { slot: 'snack', label: 'Snack', icon: '🍎' },
  ];

  const handleGenerateGrocery = async () => {
    setIsGeneratingGrocery(true);
    try {
      await onGenerateGroceryFromPlan();
    } finally {
      setIsGeneratingGrocery(false);
    }
  };

  const handleSlotAIGenerate = async (dayDate: string, slot: MealSlot) => {
    const key = `${dayDate}-${slot}`;
    setIsGeneratingSlotAI(key);
    try {
      await onQuickGenerateForSlot(dayDate, slot);
    } finally {
      setIsGeneratingSlotAI(null);
    }
  };

  const plannedCount = planEntries.length;

  return (
    <div className="space-y-8">
      {/* Header & Week Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Nutrition Routine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meal Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Assign breakfast, lunch, and dinner to keep healthy eating effortless.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Nav Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800">
              {weekOffset === 0 ? 'This Week' : weekOffset === 1 ? 'Next Week' : weekOffset === -1 ? 'Last Week' : `${weekOffset > 0 ? '+' : ''}${weekOffset} Wks`}
            </span>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            id="generate-grocery-from-plan-btn"
            onClick={handleGenerateGrocery}
            disabled={isGeneratingGrocery || plannedCount === 0}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Generate Grocery List ({plannedCount} Meals)</span>
          </button>
        </div>
      </div>

      {/* 7-Day Interactive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          return (
            <div
              key={day.dateStr}
              className={`flex flex-col rounded-3xl border p-4 transition-all ${
                day.isToday
                  ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-400/30 shadow-xs'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <span className={`text-sm font-extrabold block ${day.isToday ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {day.dayLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{day.formattedDate}</span>
                </div>
                {day.isToday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    Today
                  </span>
                )}
              </div>

              {/* Slots List */}
              <div className="space-y-2.5 flex-1 flex flex-col justify-between">
                {slots.map((s) => {
                  const entry = planEntries.find(
                    (e) => e.day_date === day.dateStr && e.meal_slot === s.slot
                  );
                  const isAILoading = isGeneratingSlotAI === `${day.dateStr}-${s.slot}`;

                  return (
                    <div
                      key={s.slot}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between min-h-[90px] group/slot hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                        <span className="flex items-center gap-1">
                          <span>{s.icon}</span>
                          <span className="capitalize">{s.label}</span>
                        </span>
                        {entry && (
                          <button
                            onClick={() => onRemovePlanEntry(entry.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                            title="Remove meal from slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Slot Content */}
                      {entry?.meal ? (
                        <div
                          onClick={() => entry.meal && onOpenMealDetail(entry.meal)}
                          className="cursor-pointer group/meal pt-1"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xl">{entry.meal.emoji || '🍽️'}</span>
                            <span className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover/meal:text-emerald-700 transition-colors">
                              {entry.meal.meal_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span>⏱️ {entry.meal.time_minutes}m</span>
                            <span>•</span>
                            <span>{entry.meal.difficulty}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 pt-1">
                          <button
                            onClick={() => setSlotPicker({ dayDate: day.dateStr, slot: s.slot })}
                            className="w-full py-1.5 px-2 rounded-xl text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 flex items-center justify-center gap-1 transition-all shadow-2xs"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                            <span>Pick Saved</span>
                          </button>

                          <button
                            onClick={() => handleSlotAIGenerate(day.dateStr, s.slot)}
                            disabled={isAILoading}
                            className="w-full py-1 px-2 rounded-xl text-[10px] font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>{isAILoading ? 'AI Thinking...' : 'AI Suggest'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Saved Meal Quick Selector Modal */}
      {slotPicker && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSlotPicker(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Select Meal for {slotPicker.dayDate} ({slotPicker.slot})
                </h3>
                <p className="text-xs text-slate-500">Pick from your saved recipes</p>
              </div>
              <button
                onClick={() => setSlotPicker(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {savedMeals.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  You haven't saved any meals yet. Generate one in "What Should I Eat?" or "Categories"!
                </div>
              ) : (
                savedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    onClick={() => {
                      onSetPlanEntry(slotPicker.dayDate, slotPicker.slot, meal);
                      setSlotPicker(null);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{meal.emoji || '🍽️'}</span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800">
                          {meal.meal_name}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          ⏱️ {meal.time_minutes}m • {meal.difficulty}
                        </span>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold group-hover:bg-emerald-700">
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
