import React from "react";
import { Sparkles, Star, Flame, Heart, CheckCircle, Info } from "lucide-react";
import { PersonalizedTradition } from "../types/planner";

interface TraditionsSectionProps {
  traditions: PersonalizedTradition[];
  onToggleFavorite: (traditionId: string) => void;
}

export const TraditionsSection: React.FC<TraditionsSectionProps> = ({
  traditions,
  onToggleFavorite,
}) => {
  const getCostBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "budget-friendly":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "luxury":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
  };

  return (
    <section aria-labelledby="traditions-heading" className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-[#EEDBCA] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E05A1B]">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Vedic Customs & Festive Magic</span>
        </div>
        <h2
          id="traditions-heading"
          className="text-2xl font-bold text-[#2C1810] font-serif-indian"
        >
          5 Personalized Indian Traditions & Ritual Concepts
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Authentic customs tailored to your celebration type, city, and guest dynamics.
        </p>
      </div>

      {/* Grid of 5 traditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {traditions.map((tradition, idx) => (
          <div
            key={tradition.id || idx}
            className={`bg-white rounded-3xl border p-6 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between relative overflow-hidden ${
              tradition.isFavorited
                ? "border-amber-400 ring-2 ring-amber-200/80 bg-gradient-to-br from-white via-[#FFFDF9] to-amber-50/30"
                : "border-[#EFE4D6]"
            }`}
          >
            {/* Top row */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-[#E05A1B] to-[#FFB800] text-white text-xs font-extrabold shadow-xs">
                    0{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCostBadge(
                      tradition.approximateCostLevel
                    )}`}
                  >
                    {tradition.approximateCostLevel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(tradition.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    tradition.isFavorited
                      ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                      : "text-stone-300 hover:text-amber-400 hover:bg-stone-50"
                  }`}
                  aria-label={
                    tradition.isFavorited
                      ? `Remove ${tradition.title} from favorites`
                      : `Add ${tradition.title} to favorites`
                  }
                  title={tradition.isFavorited ? "Favorited!" : "Save as favorite idea"}
                >
                  <Star
                    className={`w-5 h-5 ${
                      tradition.isFavorited ? "fill-amber-400 text-amber-500" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#2A170B] font-serif-indian leading-snug">
                {tradition.title}
              </h3>

              {/* Cultural Significance Highlight */}
              {tradition.culturalHighlight && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200/60 text-[#8C3200] text-xs font-medium">
                  <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>{tradition.culturalHighlight}</span>
                </div>
              )}

              {/* Ritual Context */}
              <p className="mt-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                {tradition.ritualContext}
              </p>
            </div>

            {/* How to Execute Steps */}
            <div className="mt-4 pt-4 border-t border-[#F5ECE0] bg-[#FAF5EE] -mx-6 -mb-6 p-5">
              <span className="text-[11px] font-extrabold text-[#7A3E14] uppercase tracking-wider block mb-1">
                How to Bring This to Life:
              </span>
              <p className="text-xs text-stone-800 font-medium leading-relaxed">
                {tradition.howToExecute}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
