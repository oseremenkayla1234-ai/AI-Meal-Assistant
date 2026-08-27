import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { Meal, MealSlot } from '../types';

interface AddToPlanModalProps {
  meal: Meal | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPlan: (dayDate: string, slot: MealSlot, meal: Meal) => void;
}

export const AddToPlanModal: React.FC<AddToPlanModalProps> = ({
  meal,
  isOpen,
  onClose,
  onConfirmPlan,
}) => {
  // Generate next 7 days starting today
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { dateStr, dayName, formattedDate };
  });

  const [selectedDate, setSelectedDate] = useState<string>(days[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot>('dinner');

  if (!isOpen || !meal) return null;

  const handleConfirm = () => {
    onConfirmPlan(selectedDate, selectedSlot, meal);
    onClose();
  };

  const slots: { slot: MealSlot; label: string; icon: string }[] = [
    { slot: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { slot: 'lunch', label: 'Lunch', icon: '🥗' },
    { slot: 'dinner', label: 'Dinner', icon: '🍲' },
    { slot: 'snack', label: 'Snack', icon: '🍎' },
  ];

  return (
    <div
      id="add-to-plan-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="add-to-plan-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-plan-title"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-to-plan-title" className="text-base sm:text-lg font-bold text-slate-900">
                Add to Meal Plan
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[200px]">
                {meal.emoji} {meal.meal_name}
              </p>
            </div>
          </div>
          <button
            id="close-add-to-plan-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Select Day
          </label>
          <div className="grid grid-cols-4 gap-2">
            {days.map((d) => {
              const isSelected = selectedDate === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-bold">{d.dayName}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {d.formattedDate}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Meal Slot Selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Select Meal Slot
          </label>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((s) => {
              const isSelected = selectedSlot === s.slot;
              return (
                <button
                  key={s.slot}
                  onClick={() => setSelectedSlot(s.slot)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs sm:text-sm capitalize">{s.label}</span>
                  {isSelected && <Check className="w-4 h-4 ml-auto text-emerald-600 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            id="cancel-add-to-plan-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-add-to-plan-btn"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            Confirm Plan
          </button>
        </div>
      </div>
    </div>
  );
};
