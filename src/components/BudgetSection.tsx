import React, { useState } from "react";
import {
  IndianRupee,
  PieChart,
  Lightbulb,
  Sparkles,
  TrendingDown,
  Info,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { BudgetItem } from "../types/planner";
import { formatINR, formatInIndianWords } from "../utils/formatters";

interface BudgetSectionProps {
  items: BudgetItem[];
  totalBudgetINR: number;
  isTightBudget?: boolean;
}

const CATEGORY_COLORS = [
  "bg-amber-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-emerald-600",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-stone-500",
];

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  items,
  totalBudgetINR,
  isTightBudget,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id || null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const calculatedTotal = items.reduce((acc, curr) => acc + curr.amountINR, 0);

  return (
    <section aria-labelledby="budget-breakdown-heading" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#EEDBCA] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E05A1B]">
            <IndianRupee className="w-4 h-4" />
            <span>Financial Blueprint in INR • 5-10% Safety Cushion</span>
          </div>
          <h2
            id="budget-breakdown-heading"
            className="text-2xl font-bold text-[#2C1810] font-serif-indian"
          >
            Budget Breakdown & Indian Market Savings
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-stone-500 font-medium">Allocated Budget: </span>
          <span className="text-base font-extrabold text-[#2C1810]">
            {formatINR(totalBudgetINR)}
          </span>
          <span className="text-xs font-bold text-[#E05A1B] ml-1">
            ({formatInIndianWords(totalBudgetINR)})
          </span>
        </div>
      </div>

      {/* Tight Budget Strategy Banner */}
      {isTightBudget && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 shadow-xs flex items-start gap-3 text-xs sm:text-sm text-[#52290D]">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-[#7A3600]">
              Essentials-First Budget Strategy Active:
            </span>{" "}
            Because this celebration is on a tighter per-guest budget, funds have been concentrated on core essentials: wholesome single-cuisine feast, functional community hall, and wholesale marigold florals. A protective <strong>5–10% contingency reserve</strong> is preserved below for unexpected expenses.
          </div>
        </div>
      )}

      {/* Visual Distribution Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#F0E6D8] shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-2">
          <span>Expense Allocation Across Categories</span>
          <span>{items.length} Major Cost Centers</span>
        </div>
        {/* Multi-segmented colored progress bar */}
        <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex shadow-inner">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} transition-all duration-300 relative group`}
              style={{ width: `${item.percent}%` }}
              title={`${item.category}: ${item.percent}% (${formatINR(item.amountINR)})`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-stone-100">
          {items.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleExpand(item.id)}
              className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-900 transition-colors focus:outline-none"
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
                }`}
              />
              <span className="font-medium truncate max-w-[140px]">{item.category}</span>
              <span className="font-bold text-stone-900">({item.percent}%)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const isExpanded = expandedId === item.id;
          const colorClass = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${
                isExpanded ? "border-amber-300 ring-2 ring-amber-100" : "border-[#EFE5D8]"
              }`}
            >
              <div
                onClick={() => toggleExpand(item.id)}
                className="p-5 cursor-pointer flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ${colorClass}`}
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#2A170C] leading-snug">
                      {item.category}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold text-[#2C1810]">
                    {formatINR(item.amountINR)}
                  </div>
                  <div className="text-xs font-bold text-[#E05A1B]">
                    {item.percent}% of budget
                  </div>
                </div>
              </div>

              {/* Collapsible Details & Cost Saving Tip */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-[#F7EFE4] space-y-3">
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Indian Cost Saving Tip Box */}
                  {item.costSavingTip && (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-[#9A3800] uppercase tracking-wider block">
                          Desi Market Cost-Saving Hack
                        </span>
                        <p className="text-xs text-[#52290D] font-medium leading-relaxed mt-0.5">
                          {item.costSavingTip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
