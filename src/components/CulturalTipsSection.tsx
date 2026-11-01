import React from "react";
import { Info, MapPin, Sparkles, Check } from "lucide-react";

interface CulturalTipsSectionProps {
  tips: string[];
  city: string;
}

export const CulturalTipsSection: React.FC<CulturalTipsSectionProps> = ({
  tips,
  city,
}) => {
  return (
    <section aria-labelledby="cultural-advice-heading" className="bg-[#FAF6EE] rounded-3xl border border-[#EEDBCA] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E05A1B] mb-1">
        <MapPin className="w-4 h-4" />
        <span>Regional Nuances & Hospitality</span>
      </div>
      <h2
        id="cultural-advice-heading"
        className="text-xl sm:text-2xl font-bold text-[#2C1810] font-serif-indian"
      >
        Local Logistics & Cultural Wisdom for {city}
      </h2>
      <p className="text-xs text-stone-600 mt-1 mb-5">
        Practical pointers for weather, traffic buffers, municipal sound curfews, and 'Atithi Devo Bhava' guest care.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl border border-[#EFE4D6] shadow-2xs flex items-start gap-3"
          >
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-[#E05A1B] shrink-0 mt-0.5">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
              {tip}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
