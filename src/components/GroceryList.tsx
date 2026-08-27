import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  CheckCheck,
  Copy,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { GroceryItem } from '../types';

interface GroceryListProps {
  items: GroceryItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item_name: string, category: GroceryItem['category']) => void;
  onDeleteItem: (id: string) => void;
  onClearChecked: () => void;
  onGenerateFromPlanner: () => void;
}

const CATEGORY_META: Record<
  GroceryItem['category'],
  { label: string; icon: string; badgeColor: string }
> = {
  produce: { label: 'Fresh Produce', icon: '🥦', badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  protein: { label: 'Meat & Proteins', icon: '🥩', badgeColor: 'bg-amber-100 text-amber-900 border-amber-200' },
  dairy: { label: 'Dairy & Alternatives', icon: '🥛', badgeColor: 'bg-blue-100 text-blue-900 border-blue-200' },
  pantry: { label: 'Pantry & Grains', icon: '🌾', badgeColor: 'bg-orange-100 text-orange-900 border-orange-200' },
  other: { label: 'Other Essentials', icon: '🛒', badgeColor: 'bg-slate-100 text-slate-900 border-slate-200' },
};

export const GroceryList: React.FC<GroceryListProps> = ({
  items,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onClearChecked,
  onGenerateFromPlanner,
}) => {
  const [newItemName, setNewItemName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<GroceryItem['category']>('produce');
  const [copied, setCopied] = useState<boolean>(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim(), newCategory);
    setNewItemName('');
  };

  const handleCopyList = () => {
    if (items.length === 0) return;
    const text = (['produce', 'protein', 'dairy', 'pantry', 'other'] as GroceryItem['category'][])
      .map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        const catName = CATEGORY_META[cat].label.toUpperCase();
        const lines = catItems.map((i) => `  [${i.checked ? 'x' : ' '}] ${i.item_name}`).join('\n');
        return `${catName}:\n${lines}`;
      })
      .filter(Boolean)
      .join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((checkedCount / totalCount) * 100);

  const categoriesOrder: GroceryItem['category'][] = ['produce', 'protein', 'dairy', 'pantry', 'other'];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2 border border-emerald-200">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Smart Ingredient Aggregator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Grocery List
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Auto-categorized ingredients from your meal planner and saved recipes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onGenerateFromPlanner}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Sync from Planner</span>
          </button>

          <button
            onClick={handleCopyList}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'List Copied!' : 'Copy List'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      {totalCount > 0 && (
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Shopping Progress
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                {checkedCount} of {totalCount} items
              </span>
            </div>
            <div className="w-full sm:w-64 h-2 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {checkedCount > 0 && (
            <button
              onClick={onClearChecked}
              className="text-xs font-semibold text-rose-700 hover:text-rose-900 hover:underline px-3 py-1"
            >
              Clear {checkedCount} checked items
            </button>
          )}
        </div>
      )}

      {/* Add Item Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <input
            id="add-grocery-input"
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add an item (e.g. Greek yogurt, olive oil, baby spinach)..."
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <select
          id="grocery-category-select"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as any)}
          aria-label="Item Category"
          className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <option value="produce">🥦 Fresh Produce</option>
          <option value="protein">🥩 Protein</option>
          <option value="dairy">🥛 Dairy / Alt</option>
          <option value="pantry">🌾 Pantry</option>
          <option value="other">🛒 Other</option>
        </select>

        <button
          type="submit"
          disabled={!newItemName.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors shrink-0 disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </form>

      {/* Categorized Grocery Items */}
      {totalCount === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            Your grocery list is empty
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Add ingredients manually above or click "Sync from Planner" to load items from your weekly meal schedule!
          </p>
          <button
            onClick={onGenerateFromPlanner}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            Sync from Weekly Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoriesOrder.map((catKey) => {
            const catItems = items.filter((i) => i.category === catKey);
            if (catItems.length === 0) return null;
            const meta = CATEGORY_META[catKey];

            return (
              <div
                key={catKey}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {meta.label}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {catItems.length}
                  </span>
                </div>

                <ul className="space-y-2">
                  {catItems.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => onToggleItem(item.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs sm:text-sm cursor-pointer transition-all ${
                        item.checked
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                          : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                            item.checked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item.item_name}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
