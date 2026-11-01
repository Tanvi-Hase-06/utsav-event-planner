import React from "react";
import { Sparkles, Bookmark, RotateCcw, Calendar, MapPin, IndianRupee } from "lucide-react";
import { EventPlan } from "../types/planner";

interface HeaderProps {
  savedPlansCount: number;
  onOpenSavedPlans: () => void;
  onResetPlan: () => void;
  hasActivePlan: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  savedPlansCount,
  onOpenSavedPlans,
  onResetPlan,
  hasActivePlan,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#F0E6D8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Cultural branding */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E05A1B] via-[#F37021] to-[#FFB800] text-white shadow-md shadow-orange-500/20 ring-2 ring-amber-300/50">
              {/* Diya / Kalash inspired flame */}
              <span className="text-2xl font-bold font-festive select-none">ॐ</span>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping opacity-60" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight text-[#3A1700] font-serif-indian">
                  Utsav
                </span>
                <span className="text-xs px-2 py-0.5 font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200 hidden sm:inline-block">
                  AI Event Planner
                </span>
              </div>
              <p className="text-xs text-[#7A4B29] font-medium tracking-wide">
                भारतीय उत्सव एवं मांगलिक आयोजन योजनाकार
              </p>
            </div>
          </div>

          {/* Key Value Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-[#684022]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5ECE0] border border-[#E9DAC8]">
              <IndianRupee className="w-3.5 h-3.5 text-[#E05A1B]" />
              <span>Smart INR Budgeting</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5ECE0] border border-[#E9DAC8]">
              <Calendar className="w-3.5 h-3.5 text-[#E05A1B]" />
              <span>Reverse Timeline</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5ECE0] border border-[#E9DAC8]">
              <Sparkles className="w-3.5 h-3.5 text-[#E05A1B]" />
              <span>Vedic Traditions</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSavedPlans}
              className="relative flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl text-[#52290D] bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
              title="View saved celebration plans"
              aria-label={`Saved Plans (${savedPlansCount})`}
            >
              <Bookmark className="w-4 h-4 text-[#E05A1B]" />
              <span className="hidden sm:inline">Saved Plans</span>
              {savedPlansCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-[#E05A1B] rounded-full">
                  {savedPlansCount}
                </span>
              )}
            </button>

            {hasActivePlan && (
              <button
                onClick={onResetPlan}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                title="Create a new celebration plan"
                aria-label="Create new plan"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden md:inline">Plan Another</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
