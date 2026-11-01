import React, { useEffect } from "react";
import {
  AlertTriangle,
  IndianRupee,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { BudgetRealityCheckResult } from "../utils/budgetCheck";
import { formatINR, formatInIndianWords } from "../utils/formatters";

interface BudgetRealityModalProps {
  isOpen: boolean;
  onClose: () => void;
  realityCheck: BudgetRealityCheckResult;
  currentBudgetINR: number;
  guestCount: number;
  eventType: string;
  onProceedWithCurrentBudget: () => void;
  onApplySuggestedBudget: (newBudget: number) => void;
}

export const BudgetRealityModal: React.FC<BudgetRealityModalProps> = ({
  isOpen,
  onClose,
  realityCheck,
  currentBudgetINR,
  guestCount,
  eventType,
  onProceedWithCurrentBudget,
  onApplySuggestedBudget,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-reality-title"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs ring-1 ring-white/30 text-white shadow-xs">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full text-white">
                  Reality Check
                </span>
                <span className="text-xs text-amber-100 font-medium">
                  {realityCheck.benchmarkLabel}
                </span>
              </div>
              <h3
                id="budget-reality-title"
                className="text-xl font-bold font-serif-indian leading-tight mt-0.5"
              >
                Tight Celebration Budget Alert
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Close reality check modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Per-Guest Comparison Pill */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Calculated Per-Guest Spend
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-red-600">
                  {formatINR(realityCheck.perGuest)}
                </span>
                <span className="text-xs font-semibold text-stone-600">
                  per guest for {guestCount} attendees
                </span>
              </div>
            </div>

            <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-amber-200/80 pt-2 sm:pt-0 sm:pl-4">
              <span className="text-xs font-medium text-stone-500 block">
                Market Standard
              </span>
              <span className="text-base font-bold text-emerald-800">
                Min {formatINR(realityCheck.threshold)} / guest
              </span>
            </div>
          </div>

          {/* Explanation from Indian event benchmarks */}
          <div className="space-y-2 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <p className="font-medium text-[#3A1F0D]">
              {realityCheck.reasonMessage}
            </p>
            <p className="text-stone-600">
              {realityCheck.adviceMessage}
            </p>
          </div>

          {/* Budget Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Current Budget */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
              <span className="text-xs font-semibold text-stone-500 block">
                Your Current Budget
              </span>
              <div className="text-xl font-bold text-stone-800 mt-1">
                {formatINR(currentBudgetINR)}
              </div>
              <span className="text-[11px] font-medium text-amber-700 block mt-0.5">
                {formatInIndianWords(currentBudgetINR)} (Economy scale)
              </span>
            </div>

            {/* Suggested Minimum Budget */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[10px] font-extrabold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                Recommended
              </div>
              <span className="text-xs font-bold text-emerald-900 block">
                Suggested Minimum Budget
              </span>
              <div className="text-xl font-extrabold text-emerald-800 mt-1">
                {formatINR(realityCheck.suggestedMinimumBudget)}
              </div>
              <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                {formatInIndianWords(realityCheck.suggestedMinimumBudget)} (+{formatINR(realityCheck.difference)})
              </span>
            </div>
          </div>

          {/* Tight Budget Guarantee Note */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5 text-xs text-stone-600">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-800">
                If you proceed with your current budget:
              </span>{" "}
              Gemini will prioritize foundational essentials (streamlined catering, community/temple venue, local mandi marigold decor), suggest maximum cost-cutting tricks, and secure a <strong>5–10% contingency buffer</strong> for safety.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 bg-[#FAF6EE] border-t border-[#EEDBCA] flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
          >
            Adjust Form Manually
          </button>

          <button
            type="button"
            onClick={onProceedWithCurrentBudget}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors text-center"
          >
            Continue with Tight Budget
          </button>

          <button
            type="button"
            onClick={() => onApplySuggestedBudget(realityCheck.suggestedMinimumBudget)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-[#E05A1B] to-[#F37021] hover:from-orange-600 hover:to-orange-500 shadow-md shadow-orange-500/20 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Apply Suggested ({formatInIndianWords(realityCheck.suggestedMinimumBudget)}) & Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
